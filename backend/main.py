from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import time, re, json, os
import joblib

MODEL_PATH   = os.path.join(os.path.dirname(__file__), "pipeline.joblib")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "metrics.json")

pipeline = joblib.load(MODEL_PATH)
with open(METRICS_PATH) as f:
    _raw_metrics = json.load(f)

tfidf    = pipeline.named_steps["tfidf"]
clf      = pipeline.named_steps["clf"]
features = tfidf.get_feature_names_out()
coefs    = clf.coef_[0]

app = FastAPI(
    title="Fake News Classifier API",
    description="Logistic Regression + TF-IDF trained on FakeNewsNet (GossipCop + PolitiFact)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ────────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    text: str = Field(..., min_length=5, max_length=5000,
                      example="BREAKING: Government hides shocking truth about vaccines")

class TokenWeight(BaseModel):
    token: str
    weight: float
    direction: str

class PredictResponse(BaseModel):
    label: str
    confidence: float
    fake_probability: float
    real_probability: float
    risk_level: str
    risk_color: str
    top_tokens: list[TokenWeight]
    inference_ms: float
    clean_text: str

class BatchRequest(BaseModel):
    texts: list[str]

class BatchItem(BaseModel):
    text: str
    label: str
    confidence: float
    fake_probability: float
    risk_level: str
    risk_color: str

class BatchResponse(BaseModel):
    results: list[BatchItem]
    total_ms: float

class ModelInfoResponse(BaseModel):
    model_name: str
    test_accuracy: float
    test_roc_auc: float
    cv_auc_mean: float
    cv_auc_std: float
    train_size: int
    test_size: int
    # FIX: JSON serialises Python int keys (0, 1) as strings ("0", "1").
    # Use dict[str, float] to reflect the actual JSON structure.
    class_weights: dict[str, float]
    top_fake_words: list
    top_real_words: list

# ── Helpers ────────────────────────────────────────────────────────────────────
def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"[^a-z0-9\s\'-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def get_risk(fake_prob: float):
    if fake_prob >= 0.85: return "CRITICAL", "#EF4444"
    if fake_prob >= 0.65: return "HIGH",     "#F97316"
    if fake_prob >= 0.40: return "MEDIUM",   "#F59E0B"
    return "LOW", "#22C55E"

def get_token_weights(ct: str, n: int = 12) -> list[TokenWeight]:
    vec    = tfidf.transform([ct])
    # FIX: convert sparse row to dense array for reliable scalar indexing
    dense  = vec.toarray()[0]
    idxs   = vec.nonzero()[1]
    scored = []
    for idx in idxs:
        w = float(dense[idx] * coefs[idx])
        scored.append(TokenWeight(
            token=features[idx],
            weight=round(abs(w), 4),
            direction="real" if w > 0 else "fake",
        ))
    scored.sort(key=lambda x: x.weight, reverse=True)
    return scored[:n]

def predict_one(text: str) -> dict:
    ct     = clean_text(text)
    prob   = pipeline.predict_proba([ct])[0]
    fake_p = float(prob[0])
    real_p = float(prob[1])
    label  = "FAKE" if fake_p > real_p else "REAL"
    conf   = max(fake_p, real_p)
    rl, rc = get_risk(fake_p)
    tokens = get_token_weights(ct)
    return dict(
        label=label,
        confidence=round(conf, 4),
        fake_probability=round(fake_p, 4),
        real_probability=round(real_p, 4),
        risk_level=rl,
        risk_color=rc,
        top_tokens=tokens,
        clean_text=ct,
    )

# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {"message": "Fake News Classifier API v1.0", "docs": "/docs"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "model": "pipeline.joblib", "features": int(len(features))}

@app.get("/model/info", response_model=ModelInfoResponse, tags=["Model"])
def model_info():
    allowed = {
        "test_accuracy", "test_roc_auc", "cv_auc_mean", "cv_auc_std",
        "train_size", "test_size", "class_weights", "top_fake_words", "top_real_words"
    }
    payload = {k: v for k, v in _raw_metrics.items() if k in allowed}
    return ModelInfoResponse(
        model_name="Logistic Regression + TF-IDF (bigrams, 50k features)",
        **payload
    )

@app.post("/predict", response_model=PredictResponse, tags=["Predict"])
def predict(req: PredictRequest):
    t0  = time.perf_counter()
    res = predict_one(req.text)
    res["inference_ms"] = round((time.perf_counter() - t0) * 1000, 2)
    return PredictResponse(**res)

@app.post("/batch", response_model=BatchResponse, tags=["Predict"])
def batch(req: BatchRequest):
    if not req.texts:
        raise HTTPException(400, "No texts provided")
    if len(req.texts) > 20:
        raise HTTPException(422, "Max 20 items per batch")
    t0      = time.perf_counter()
    results = []
    for text in req.texts:
        if len(text.strip()) < 5:
            continue
        r = predict_one(text)
        results.append(BatchItem(
            text=text,
            label=r["label"],
            confidence=r["confidence"],
            fake_probability=r["fake_probability"],
            risk_level=r["risk_level"],
            risk_color=r["risk_color"],
        ))
    return BatchResponse(results=results, total_ms=round((time.perf_counter() - t0) * 1000, 2))

@app.get("/examples", tags=["Utils"])
def examples():
    return {
        "fake_examples": [
            "BREAKING: Government hiding shocking truth about vaccines killing thousands",
            "Trump secretly declares martial law — mainstream media silent",
            "URGENT: Bill Gates microchip found in COVID shot, whistleblower reveals",
        ],
        "real_examples": [
            "Scientists publish new study on climate change impact on Arctic ice",
            "Federal Reserve raises interest rates by 25 basis points",
            "Academy Awards ceremony celebrates best films of the year",
        ],
    }

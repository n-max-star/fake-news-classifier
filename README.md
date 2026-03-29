# VERIDECT — Fake News Classifier [![GitHub](https://img.shields.io/github/license/n-max-star/fake-news-classifier)](https://github.com/n-max-star/fake-news-classifier) [![Backend Tests](https://github.com/n-max-star/fake-news-classifier/actions/workflows/backend.yml/badge.svg)](https://github.com/n-max-star/fake-news-classifier/actions)

Full-stack fake news detection app.  
**Model:** Logistic Regression + TF-IDF (50k features, bigrams)  
**Dataset:** FakeNewsNet — GossipCop + PolitiFact  
**Performance:** Accuracy 81.4% · ROC-AUC 87.1% · 5-Fold CV AUC 86.0%

**Source Code:** https://github.com/n-max-star/fake-news-classifier

---

## Project Structure

```
fakenews-app/
├── backend/
│   ├── main.py              ← FastAPI app (all routes)
│   ├── pipeline.joblib      ← trained model  ← COPY THIS IN
│   ├── metrics.json         ← model stats    ← COPY THIS IN
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── package.json
│   └── src/
└── .gitignore
```

---

## Quick Start

### 1. Copy model files into backend/
```bash
cp /path/to/pipeline.joblib fakenews-app/backend/
cp /path/to/metrics.json    fakenews-app/backend/
```

### 2. Start Backend
```bash
cd fakenews-app/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### 3. Start Frontend
```bash
cd fakenews-app/frontend
npm install
npm start
# → http://localhost:3000
```

---

## API Reference

### POST /predict
```json
// Request
{ "text": "BREAKING: Government hiding truth about vaccines" }

// Response
{
  "label": "FAKE",
  "confidence": 0.8412,
  "fake_probability": 0.8412,
  "real_probability": 0.1588,
  "risk_level": "HIGH",
  "risk_color": "#F97316",
  "top_tokens": [
    { "token": "breaking", "weight": 0.312, "direction": "fake" }
  ],
  "inference_ms": 3.2,
  "clean_text": "breaking government hiding truth about vaccines"
}
```

### POST /batch
```json
// Request
{ "texts": ["headline 1", "headline 2"] }

// Response
{ "results": [...], "total_ms": 12.4 }
```

### GET /model/info
Returns model accuracy, ROC-AUC, CV scores, top feature weights.

### GET /examples
Returns sample fake and real headlines to try.

---

## Risk Levels

| Level    | Fake Probability | Color    |
|----------|-----------------|----------|
| LOW      | < 40%           | #22C55E  |
| MEDIUM   | 40–65%          | #EAB308  |
| HIGH     | 65–85%          | #F97316  |
| CRITICAL | ≥ 85%           | #EF4444  |

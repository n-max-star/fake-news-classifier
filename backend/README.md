# Fake News Classifier — Backend

FastAPI backend using the trained Logistic Regression + TF-IDF model.

## Setup

```bash
cd backend

# Copy model files into this folder
cp /path/to/pipeline.joblib .
cp /path/to/metrics.json .

# Install dependencies
pip install -r requirements.txt

# Run
uvicorn main:app --reload --port 8000
```

## API Endpoints

| Method | Route          | Description                        |
|--------|----------------|------------------------------------|
| GET    | /              | Root / ping                        |
| GET    | /health        | Health check                       |
| GET    | /docs          | Swagger UI                         |
| GET    | /model/info    | Model metrics + top feature weights|
| POST   | /predict       | Classify a single headline/text    |
| POST   | /batch         | Classify up to 20 texts at once    |
| GET    | /examples      | Sample fake/real headlines         |

## Example Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "BREAKING: Government hiding truth about vaccines"}'
```

## Response Shape

```json
{
  "label": "FAKE",
  "confidence": 0.8412,
  "fake_probability": 0.8412,
  "real_probability": 0.1588,
  "risk_level": "HIGH",
  "risk_color": "#F97316",
  "top_tokens": [
    { "token": "breaking", "weight": 0.312, "direction": "fake" },
    { "token": "government", "weight": 0.198, "direction": "fake" }
  ],
  "inference_ms": 4.2,
  "clean_text": "breaking government hiding truth about vaccines"
}
```

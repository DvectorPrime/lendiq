from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from schemas import PredictionRequest, PredictionResponse, ShapValue
from model import LoanPredictionModel

ml_model = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        model = LoanPredictionModel()
        model.generateExplainer()
        ml_model['model'] = model
        ml_model['loaded'] = True
    except Exception as e:
        print(f"Failed to load model: {e}")
        ml_model['loaded'] = False
    yield
    ml_model.clear()

app = FastAPI(lifespan=lifespan)

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": ml_model.get('loaded', False)}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if not ml_model.get('loaded', False):
        raise HTTPException(status_code=503, detail="Model is not loaded")
        
    try:
        input_data = request.model_dump()
        
        pred_result = ml_model['model'].predict(input_data)
        risk_score = pred_result['probability'] * 100
        
        explain_result = ml_model['model'].explainResults(input_data)
        
        shap_values = []
        for contrib in explain_result['feature_contributions']:
            shap_values.append(
                ShapValue(
                    feature=contrib['feature'],
                    value=contrib['actual_value'],
                    shap_value=contrib['impact_on_probability'],
                    description=contrib['description']
                )
            )
            
        return PredictionResponse(
            risk_score=risk_score,
            shap_values=shap_values
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
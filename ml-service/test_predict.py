from fastapi.testclient import TestClient
from app.main import app

with TestClient(app) as client:
    response = client.get("/health")
    print("Health Status:", response.status_code)
    print("Health JSON:", response.json())
    
    payload = {
        "dateOfBirth": "1980-01-01",
        "employmentDurationYears": 5.0,
        "annualIncome": 50000.0,
        "loanAmount": 10000.0,
        "numChildren": 2,
        "numFamilyMembers": 4,
        "ownsVehicle": True,
        "ownsRealEstate": True,
        "employmentType": "Working",
        "educationLevel": "Secondary",
        "housingType": "House/apartment",
        "maritalStatus": "Married"
    }
    
    predict_response = client.post("/predict", json=payload)
    print("Predict Status:", predict_response.status_code)
    try:
        print("Predict JSON:", predict_response.json())
    except Exception as e:
        print("Predict error text:", predict_response.text)

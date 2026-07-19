import requests
import time

url = "http://127.0.0.1:8001"

print("Waiting for server to start...")
for _ in range(10):
    try:
        res = requests.get(f"{url}/health")
        if res.status_code == 200:
            print("Server is up!")
            break
    except requests.ConnectionError:
        time.sleep(1)
else:
    print("Server did not start in time.")
    exit(1)

print("Health JSON:", res.json())

payload = {
    "dateOfBirth": "1980-01-01",
    "employmentDurationYears": 5.0,
    "annualIncome": 50000.0,
    "loanAmount": 10000.0,
    "loanTermMonths": 60.0,
    "numChildren": 2,
    "numFamilyMembers": 4,
    "ownsVehicle": True,
    "ownsRealEstate": True,
    "employmentType": "Working",
    "educationLevel": "Secondary Education",
    "housingType": "House / apartment",
    "maritalStatus": "Married"
}

print("\nTesting /predict endpoint...")
predict_response = requests.post(f"{url}/predict", json=payload)
print("Predict Status:", predict_response.status_code)
try:
    print("Predict JSON:", predict_response.json())
except Exception as e:
    print("Predict error text:", predict_response.text)

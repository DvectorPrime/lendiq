import sys
import os
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.model import LoanPredictionModel

def run_tests():
    print("Loading Model...")
    model = LoanPredictionModel()
    
    print("Generating Explainer...")
    model.generateExplainer()

    scenarios = [
        {
            'desc': 'High Income, Employed, No Defaults',
            'data': {
                'dateOfBirth': '1985-05-14', 'employmentType': 'Working', 'employmentDurationYears': 10.0,
                'educationLevel': 'Higher education', 'maritalStatus': 'Married', 'numChildren': 1,
                'numFamilyMembers': 3.0, 'annualIncome': 120000, 'ownsVehicle': 1, 'ownsRealEstate': 1,
                'housingType': 'House / apartment', 'loanAmount': 50000
            }
        },
        {
            'desc': 'Low Income, Unemployed (Anomaly)',
            'data': {
                'dateOfBirth': '1995-11-20', 'employmentType': 'Pensioner', 'employmentDurationYears': None,
                'educationLevel': 'Secondary / secondary special', 'maritalStatus': 'Single / not married', 
                'numChildren': 0, 'numFamilyMembers': 1.0, 'annualIncome': 25000, 'ownsVehicle': 0, 
                'ownsRealEstate': 0, 'housingType': 'Rented apartment', 'loanAmount': 100000
            }
        },
        {
            'desc': 'Young Student, Short Employment',
            'data': {
                'dateOfBirth': '2001-01-10', 'employmentType': 'Student', 'employmentDurationYears': 1.5,
                'educationLevel': 'Incomplete higher', 'maritalStatus': 'Single / not married', 
                'numChildren': 0, 'numFamilyMembers': 1.0, 'annualIncome': 15000, 'ownsVehicle': 0, 
                'ownsRealEstate': 0, 'housingType': 'With parents', 'loanAmount': 10000
            }
        },
        {
            'desc': 'High Loan Amount vs Low Income',
            'data': {
                'dateOfBirth': '1990-08-22', 'employmentType': 'Commercial associate', 'employmentDurationYears': 4.0,
                'educationLevel': 'Secondary / secondary special', 'maritalStatus': 'Married', 
                'numChildren': 2, 'numFamilyMembers': 4.0, 'annualIncome': 40000, 'ownsVehicle': 1, 
                'ownsRealEstate': 0, 'housingType': 'House / apartment', 'loanAmount': 300000
            }
        },
        {
            'desc': 'State Servant, Stable',
            'data': {
                'dateOfBirth': '1975-03-30', 'employmentType': 'State servant', 'employmentDurationYears': 20.0,
                'educationLevel': 'Higher education', 'maritalStatus': 'Married', 
                'numChildren': 2, 'numFamilyMembers': 4.0, 'annualIncome': 85000, 'ownsVehicle': 1, 
                'ownsRealEstate': 1, 'housingType': 'House / apartment', 'loanAmount': 150000
            }
        },
        {
            'desc': 'Widow, No Employment Data',
            'data': {
                'dateOfBirth': '1950-12-05', 'employmentType': 'Pensioner', 'employmentDurationYears': None,
                'educationLevel': 'Lower secondary', 'maritalStatus': 'Widow', 
                'numChildren': 0, 'numFamilyMembers': 1.0, 'annualIncome': 18000, 'ownsVehicle': 0, 
                'ownsRealEstate': 1, 'housingType': 'House / apartment', 'loanAmount': 20000
            }
        },
        {
            'desc': 'High Children Count, Average Income',
            'data': {
                'dateOfBirth': '1988-06-16', 'employmentType': 'Working', 'employmentDurationYears': 6.0,
                'educationLevel': 'Secondary / secondary special', 'maritalStatus': 'Married', 
                'numChildren': 4, 'numFamilyMembers': 6.0, 'annualIncome': 50000, 'ownsVehicle': 1, 
                'ownsRealEstate': 0, 'housingType': 'Municipal apartment', 'loanAmount': 80000
            }
        },
        {
            'desc': 'Academic Degree, High Loan',
            'data': {
                'dateOfBirth': '1980-09-09', 'employmentType': 'Commercial associate', 'employmentDurationYears': 12.0,
                'educationLevel': 'Academic degree', 'maritalStatus': 'Separated', 
                'numChildren': 1, 'numFamilyMembers': 2.0, 'annualIncome': 150000, 'ownsVehicle': 1, 
                'ownsRealEstate': 1, 'housingType': 'House / apartment', 'loanAmount': 500000
            }
        },
        {
            'desc': 'Civil Marriage, Co-op Apartment',
            'data': {
                'dateOfBirth': '1992-02-14', 'employmentType': 'Working', 'employmentDurationYears': 3.5,
                'educationLevel': 'Higher education', 'maritalStatus': 'Civil marriage', 
                'numChildren': 0, 'numFamilyMembers': 2.0, 'annualIncome': 65000, 'ownsVehicle': 0, 
                'ownsRealEstate': 1, 'housingType': 'Co-op apartment', 'loanAmount': 120000
            }
        },
        {
            'desc': 'Unemployed Status, Missing Duration',
            'data': {
                'dateOfBirth': '1998-07-25', 'employmentType': 'Unemployed', 'employmentDurationYears': None,
                'educationLevel': 'Secondary / secondary special', 'maritalStatus': 'Single / not married', 
                'numChildren': 0, 'numFamilyMembers': 1.0, 'annualIncome': 10000, 'ownsVehicle': 0, 
                'ownsRealEstate': 0, 'housingType': 'With parents', 'loanAmount': 5000
            }
        }
    ]

    for i, scenario in enumerate(scenarios, 1):
        print(f"\n--- Scenario {i}: {scenario['desc']} ---")
        pred = model.predict(scenario['data'])
        explanation = model.explainResults(scenario['data'])
        print(f"Prediction (0=No Default, 1=Default): {pred}")
        print("SHAP Explanation:")
        print(json.dumps(explanation, indent=2))

    print("\nAll 10 scenarios ran successfully!")

if __name__ == '__main__':
    run_tests()

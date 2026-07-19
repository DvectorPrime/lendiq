from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class PredictionRequest(BaseModel):
    dateOfBirth: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    employmentDurationYears: Optional[float] = Field(None, description="Years of employment")
    annualIncome: float = Field(..., gt=0, description="Annual income")
    loanAmount: float = Field(..., gt=0, description="Requested loan amount")
    loanTermMonths: float = Field(..., gt=0, description="Loan term in months")
    numChildren: int = Field(..., ge=0, description="Number of children")
    numFamilyMembers: float = Field(..., ge=0, description="Number of family members")
    ownsVehicle: bool = Field(..., description="Whether the applicant owns a vehicle")
    ownsRealEstate: bool = Field(..., description="Whether the applicant owns real estate")
    employmentType: Literal['Pensioner', 'Commercial associate', 'Working', 'State servant', 'Other'] = Field(..., description="Employment type enum")
    educationLevel: Literal['Secondary Education', 'Higher education', 'Lower secondary', 'Incomplete higher'] = Field(..., description="Education level enum")
    housingType: Literal['House / apartment', 'Rented apartment', 'Municipal apartment', 'With parents', 'Other_Rented'] = Field(..., description="Housing type enum")
    maritalStatus: Literal['Widow', 'Single / not married', 'Married', 'Separated', 'Civil marriage'] = Field(..., description="Marital status enum")

class ShapValue(BaseModel):
    feature: str
    value: float
    shap_value: float
    description: str

class PredictionResponse(BaseModel):
    risk_score: float = Field(..., description="Risk score from 0 to 100")
    shap_values: List[ShapValue] = Field(..., description="Top features impacting the prediction")

export class MLServiceError extends Error {
    statusCode: number;
    errors?: string[];

    constructor(message: string, statusCode: number, errors?: string[]) {
        super(message);
        this.name = 'MLServiceError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

export async function getPrediction(payload: any): Promise<{ riskScore: number; shapValues: any[] }> {
    // Map frontend/Prisma enums to Kaggle string formats expected by the ML service
    const mlPayload = { ...payload };

    const employmentMap: Record<string, string> = {
        'EMPLOYED': 'Working',
        'SELF_EMPLOYED': 'Commercial associate',
        'PENSIONER': 'Pensioner',
        'GOVERNMENT': 'State servant',
        'UNEMPLOYED': 'Other',
        'STUDENT': 'Other'
    };

    const educationMap: Record<string, string> = {
        'PRIMARY': 'Lower secondary',
        'SECONDARY': 'Secondary Education',
        'HIGHER': 'Higher education',
        'POSTGRADUATE': 'Higher education'
    };

    const housingMap: Record<string, string> = {
        'OWNS': 'House / apartment',
        'RENTS': 'Rented apartment',
        'WITH_FAMILY': 'With parents',
        'COMPANY_PROVIDED': 'Other_Rented',
        'SOCIAL_HOUSING': 'Other_Rented',
        'MUNICIPAL': 'Municipal apartment'
    };

    const maritalMap: Record<string, string> = {
        'SINGLE': 'Single / not married',
        'MARRIED': 'Married',
        'SEPARATED': 'Separated',
        'WIDOWED': 'Widow'
    };

    if (payload.employmentType) mlPayload.employmentType = employmentMap[payload.employmentType.toUpperCase()] || 'Other';
    if (payload.educationLevel) mlPayload.educationLevel = educationMap[payload.educationLevel.toUpperCase()] || 'Secondary Education';
    if (payload.housingType) mlPayload.housingType = housingMap[payload.housingType.toUpperCase()] || 'House / apartment';
    if (payload.maritalStatus) mlPayload.maritalStatus = maritalMap[payload.maritalStatus.toUpperCase()] || 'Single / not married';

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';
    
    let mlResponse;
    try {
        mlResponse = await fetch(mlServiceUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mlPayload)
        });
    } catch (e: any) {
        // Fetch failed entirely (e.g. connection refused, network error)
        throw new MLServiceError("Credit intelligence service is currently unavailable. Please try again later.", 503);
    }

    if (!mlResponse.ok) {
        let errorDetails = [];
        try {
            const rawError = await mlResponse.json();
            // Parse Pydantic validation errors nicely for the frontend
            if (rawError && rawError.detail && Array.isArray(rawError.detail)) {
                errorDetails = rawError.detail.map((err: any) => {
                    const fieldName = err.loc ? err.loc[err.loc.length - 1] : 'unknown field';
                    if (err.type === "missing") return `${fieldName} is missing`;
                    return `Invalid value for ${fieldName}: ${err.msg}`;
                });
            } else {
                errorDetails.push(rawError.message || "Unknown validation error from ML service");
            }
        } catch {
            errorDetails.push("An unexpected error occurred in the credit intelligence service.");
        }
        
        throw new MLServiceError("Failed to process loan application data.", 502, errorDetails);
    }

    const mlData = await mlResponse.json();
    
    // Helper to format enum strings like "SELF_EMPLOYED" to "Self Employed"
    const formatOriginalValue = (val: string) => {
        if (!val) return "";
        return val.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    // Map generic ML categories back to the actual user input for intuitive display
    const shapValues = mlData.shap_values.map((shap: any) => {
        let featureName = shap.feature;
        
        if (featureName.includes("Employment Type: Other") && payload.employmentType) {
            featureName = featureName.replace("Other", formatOriginalValue(payload.employmentType));
        }
        
        if (featureName.includes("Housing Type: Other_Rented") && payload.housingType) {
            featureName = featureName.replace("Other_Rented", formatOriginalValue(payload.housingType));
        }

        return {
            ...shap,
            feature: featureName
        };
    });

    return {
        riskScore: mlData.risk_score,
        shapValues: shapValues
    };
}

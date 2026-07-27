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
        'UNDERGRADUATE': 'Incomplete higher',
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
    // Derive the health URL from the predict URL (e.g. https://...onrender.com/health)
    const mlBaseUrl = mlServiceUrl.replace(/\/predict\/?$/, '');
    
    const ML_TIMEOUT_MS = 120_000; // 2 minutes — enough for Render cold start + prediction

    async function callML(): Promise<Response> {
        return fetch(mlServiceUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mlPayload),
            signal: AbortSignal.timeout(ML_TIMEOUT_MS),
        });
    }

    let mlResponse;
    try {
        mlResponse = await callML();
    } catch (firstError: any) {
        // First attempt failed — likely the Render service is asleep.
        // Send a wake-up ping to the health endpoint and retry once.
        console.log('[mlService] First attempt failed, waking ML service...', firstError.message);
        try {
            await fetch(`${mlBaseUrl}/health`, { signal: AbortSignal.timeout(ML_TIMEOUT_MS) });
        } catch {
            // Health ping itself timed out — service may be completely down
        }

        // Retry the actual prediction
        try {
            mlResponse = await callML();
        } catch (retryError: any) {
            console.error('[mlService] Retry also failed:', retryError.message);
            throw new MLServiceError(
                "Credit intelligence service is waking up. Please wait a moment and try again.", 
                503
            );
        }
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

    // Build a reverse lookup: ML category name → original user-facing label
    // This maps the Kaggle dataset labels back to the user's actual input values
    const reverseEmploymentMap: Record<string, string> = {};
    for (const [key, val] of Object.entries(employmentMap)) {
        reverseEmploymentMap[val] = formatOriginalValue(key);
    }
    const reverseEducationMap: Record<string, string> = {};
    for (const [key, val] of Object.entries(educationMap)) {
        reverseEducationMap[val] = formatOriginalValue(key);
    }
    const reverseHousingMap: Record<string, string> = {};
    for (const [key, val] of Object.entries(housingMap)) {
        reverseHousingMap[val] = formatOriginalValue(key);
    }
    const reverseMaritalMap: Record<string, string> = {};
    for (const [key, val] of Object.entries(maritalMap)) {
        reverseMaritalMap[val] = formatOriginalValue(key);
    }

    // Map ML category labels back to the user's original input for intuitive display
    const shapValues = mlData.shap_values.map((shap: any) => {
        let featureName = shap.feature;
        
        // Match patterns like "Employment Type: Commercial associate" and replace the value part
        const categoryPatterns = [
            { prefix: 'Employment Type: ', reverseMap: reverseEmploymentMap, originalKey: payload.employmentType },
            { prefix: 'Education Level: ', reverseMap: reverseEducationMap, originalKey: payload.educationLevel },
            { prefix: 'Housing Type: ', reverseMap: reverseHousingMap, originalKey: payload.housingType },
            { prefix: 'Marital Status: ', reverseMap: reverseMaritalMap, originalKey: payload.maritalStatus },
        ];

        for (const { prefix, reverseMap, originalKey } of categoryPatterns) {
            if (featureName.startsWith(prefix) && originalKey) {
                const mlValue = featureName.substring(prefix.length);
                if (reverseMap[mlValue]) {
                    featureName = prefix + formatOriginalValue(originalKey);
                }
            }
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

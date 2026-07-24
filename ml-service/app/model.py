import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import os
import shap

class LoanPredictionModel:
    def __init__(self, model_path=None):
        """
        Initializes the model. If no model_path is provided, loads the default pipeline.
        """
        if model_path is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(current_dir, '..', 'models', 'loan_default_xgb_pipeline_v3.joblib')
            
        self.model = joblib.load(model_path)
        
        # Define the exact order of features expected by the pipeline
        self.expected_columns = [
            'NAME_INCOME_TYPE', 'NAME_EDUCATION_TYPE', 'NAME_HOUSING_TYPE', 
            'NAME_FAMILY_STATUS', 'FLAG_OWN_CAR', 'FLAG_OWN_REALTY', 
            'FLAG_EMP_ANOMALY', 'CNT_CHILDREN', 'AGE_YEARS', 
            'YEARS_EMPLOYED', 'ADULT_IN_HOUSE', 'EST_LOAN_TERM', 
            'ANNUITY_MONTHLY_INCOME_RATIO', 'CHILDREN_TO_FAMILY_RATIO', 
            'CREDIT_INCOME_RATIO'
        ]
        
        # Will hold the SHAP explainer
        self.explainer = None
        self.preprocessor = None
        self.classifier = None
        self.feature_names_out = None

    def _prepare_dataframe(self, input_data: dict) -> pd.DataFrame:
        """Helper function to map JSON input to the expected DataFrame format."""
        dob = datetime.strptime(input_data['dateOfBirth'], '%Y-%m-%d')
        now = datetime.now()
        age_years = abs((now - dob).days) // 365
        
        employment_duration = input_data.get('employmentDurationYears')
        if employment_duration is None:
            flag_emp_anomaly = 1
            years_employed = 0.0
        else:
            flag_emp_anomaly = 0
            years_employed = float(int(employment_duration))
            
        amt_income = float(input_data['annualIncome'])
        amt_credit = float(input_data['loanAmount'])
        loan_term_months = float(input_data['loanTermMonths'])

        credit_income_ratio = amt_credit / amt_income if amt_income > 0 else 0.0
        
        amt_annuity = amt_credit / loan_term_months
        annuity_monthly_income_ratio = amt_annuity / (amt_income / 12) if amt_income > 0 else 0.0

        num_children = int(input_data['numChildren'])
        num_fam_members = float(input_data['numFamilyMembers'])
        adult_in_house = num_fam_members - num_children
        children_to_family_ratio = num_children / num_fam_members if num_fam_members > 0 else 0.0
        
        flag_own_car = 'Y' if input_data['ownsVehicle'] == 1 else 'N'
        flag_own_realty = 'Y' if input_data['ownsRealEstate'] == 1 else 'N'
        
        est_loan_term = int(loan_term_months)
        
        features = {
            'NAME_INCOME_TYPE': input_data['employmentType'],
            'NAME_EDUCATION_TYPE': input_data['educationLevel'],
            'NAME_HOUSING_TYPE': input_data['housingType'],
            'NAME_FAMILY_STATUS': input_data['maritalStatus'],
            'FLAG_OWN_CAR': flag_own_car,
            'FLAG_OWN_REALTY': flag_own_realty,
            'FLAG_EMP_ANOMALY': flag_emp_anomaly,
            'CNT_CHILDREN': num_children,
            'AGE_YEARS': age_years,
            'YEARS_EMPLOYED': years_employed,
            'ADULT_IN_HOUSE': adult_in_house,
            'EST_LOAN_TERM': est_loan_term,
            'ANNUITY_MONTHLY_INCOME_RATIO': annuity_monthly_income_ratio,
            'CHILDREN_TO_FAMILY_RATIO': children_to_family_ratio,
            'CREDIT_INCOME_RATIO': credit_income_ratio
        }
        
        df = pd.DataFrame([features])
        return df[self.expected_columns]

    def predict(self, input_data: dict) -> dict:
        """
        Maps frontend JSON to features and predicts class (1 for default, 0 for non-default).
        Also returns the probability of default.
        """
        df = self._prepare_dataframe(input_data)
        prediction = self.model.predict(df)[0]
        probability = self.model.predict_proba(df)[0][1]
        return {"prediction": int(prediction), "probability": float(probability)}

    def generateExplainer(self):
        """
        Extracts the classifier and preprocessor to generate the SHAP explainer.
        This should be called when the server starts to prevent latency.
        """
        if self.explainer is None:
            self.preprocessor = self.model.named_steps['preprocessor']
            self.classifier = self.model.named_steps['classifier']
            self.explainer = shap.TreeExplainer(self.classifier)
            
            # Cache the encoded feature names
            try:
                self.feature_names_out = self.preprocessor.get_feature_names_out()
            except AttributeError:
                pass # Fallback handled below

    def _format_feature_name(self, base_feat: str, actual_val_str: str = "") -> str:
        mapping = {
            "AGE_YEARS": "Age",
            "YEARS_EMPLOYED": "Years of Employment",
            "CNT_CHILDREN": "Number of Children",
            "CREDIT_INCOME_RATIO": "Loan to Income Ratio",
            "ADULT_IN_HOUSE": "Adults in Household",
            "ANNUITY_MONTHLY_INCOME_RATIO": "Monthly Payment to Income Ratio",
            "CHILDREN_TO_FAMILY_RATIO": "Children to Family Ratio",
            "FLAG_EMP_ANOMALY": "Employment Anomaly",
            "FLAG_OWN_CAR": "Car Ownership",
            "FLAG_OWN_REALTY": "Real Estate Ownership",
            "NAME_INCOME_TYPE": "Employment Type",
            "NAME_EDUCATION_TYPE": "Education Level",
            "NAME_HOUSING_TYPE": "Housing Type",
            "NAME_FAMILY_STATUS": "Marital Status",
            "EST_LOAN_TERM": "Estimated Loan Term (Months)",
        }
        
        name = mapping.get(base_feat, base_feat)
        if actual_val_str:
            if actual_val_str == 'Y': actual_val_str = 'Yes'
            if actual_val_str == 'N': actual_val_str = 'No'
            return f"{name}: {actual_val_str}"
        return name

    def explainResults(self, input_data: dict) -> dict:
        """
        Returns SHAP probability explanations for the input data.
        Returns top 8 predictors with their raw unscaled values.
        """
        if self.explainer is None:
            self.generateExplainer()
            
        # 1. Prepare raw dataframe and transform it
        df_raw = self._prepare_dataframe(input_data)
        X_transformed = self.preprocessor.transform(df_raw)
        
        if hasattr(X_transformed, 'toarray'):
            X_transformed = X_transformed.toarray()
            
        # 2. Get raw SHAP log-odds
        shap_values_raw = self.explainer(X_transformed)
        # Expected value is a scalar log-odds for binary classification
        expected_value_log_odds = self.explainer.expected_value
        
        # 3. Define sigmoid and convert to probability scale
        sigmoid = lambda x: 1 / (1 + np.exp(-x))
        base_prob = float(sigmoid(expected_value_log_odds))
        
        # SHAP raw values for the first (and only) instance
        raw_contributions = shap_values_raw.values[0]
        total_log_odds = expected_value_log_odds + np.sum(raw_contributions)
        final_prob = float(sigmoid(total_log_odds))
        
        # 4. Calculate individual probability impacts
        # To get the independent probability impact of each feature, we approximate by
        # seeing how each log-odds shift moves the probability from the base.
        # Alternatively, using the notebook's exact calculation:
        # shap_values_prob = sigmoid(expected_value + raw_shap) - expected_value_prob
        # Wait, the notebook calculates it exactly this way:
        prob_contributions = sigmoid(expected_value_log_odds + raw_contributions) - base_prob
        
        feature_names = self.feature_names_out if self.feature_names_out is not None else [f"Feature_{i}" for i in range(len(prob_contributions))]
        
        # Aggregate prob impacts by base feature
        aggregated_impacts = {}
        for feat, prob_impact in zip(feature_names, prob_contributions):
            if feat.startswith('num__'):
                base_feat = feat.replace('num__', '')
            elif feat.startswith('cat__'):
                base_feat_with_val = feat.replace('cat__', '')
                base_feat = base_feat_with_val
                # Find the longest matching column from expected_columns
                for col in sorted(self.expected_columns, key=len, reverse=True):
                    if base_feat_with_val.startswith(col + '_'):
                        base_feat = col
                        break
            else:
                base_feat = feat
                
            if base_feat not in aggregated_impacts:
                aggregated_impacts[base_feat] = 0.0
            aggregated_impacts[base_feat] += prob_impact
            
        contributions = []
        for base_feat, prob_impact in aggregated_impacts.items():
            # Get actual raw value
            if base_feat in df_raw.columns:
                raw_val = df_raw[base_feat].iloc[0]
            else:
                raw_val = 0.0
                
            is_numeric = isinstance(raw_val, (int, float, np.number))
            
            if is_numeric:
                actual_val_float = float(raw_val)
                name = self._format_feature_name(base_feat)
                if actual_val_float.is_integer():
                    formatted_feat = f"{name} {int(actual_val_float)}"
                else:
                    formatted_feat = f"{name} {round(actual_val_float, 2)}"
            else:
                actual_val_float = 0.0 # dummy
                formatted_feat = self._format_feature_name(base_feat, str(raw_val))
                
            desc = "Increases" if prob_impact > 0 else "Decreases"
            contributions.append({
                "feature": formatted_feat,
                "impact_on_probability": float(prob_impact),
                "description": f"{desc} default risk by {abs(prob_impact)*100:.1f}%",
                "actual_value": actual_val_float
            })
            
        # 6. Sort by absolute impact and take top 8
        contributions.sort(key=lambda x: abs(x['impact_on_probability']), reverse=True)
        top_8 = contributions[:8]
        
        return {
            "base_probability": base_prob,
            "final_probability": final_prob,
            "feature_contributions": top_8
        }

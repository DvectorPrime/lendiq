"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ApplicationFormData = {
  // Step 1
  applicantName: string;
  dateOfBirth: string;
  maritalStatus: string;
  numChildren: string;
  employmentType: string;
  employmentDurationYears: string;
  educationLevel: string;
  // Step 2
  annualIncome: string;
  ownsVehicle: string; // '1' or '0'
  ownsRealEstate: string; // '1' or '0'
  housingType: string;
  numFamilyMembers: string;
  // Step 3
  loanAmount: string;
  loanTermMonths: string;
};

const initialFormData: ApplicationFormData = {
  applicantName: "",
  dateOfBirth: "",
  maritalStatus: "",
  numChildren: "0",
  employmentType: "",
  employmentDurationYears: "",
  educationLevel: "",
  annualIncome: "",
  ownsVehicle: "",
  ownsRealEstate: "",
  housingType: "",
  numFamilyMembers: "1",
  loanAmount: "",
  loanTermMonths: "",
};

type ApplicationFormContextType = {
  formData: ApplicationFormData;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
};

const ApplicationFormContext = createContext<ApplicationFormContextType | undefined>(undefined);

export function ApplicationFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (data: Partial<ApplicationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const setStep = (step: number) => setCurrentStep(step);
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  return (
    <ApplicationFormContext.Provider
      value={{ formData, updateFormData, currentStep, setStep, nextStep, prevStep, resetForm }}
    >
      {children}
    </ApplicationFormContext.Provider>
  );
}

export function useApplicationForm() {
  const context = useContext(ApplicationFormContext);
  if (context === undefined) {
    throw new Error("useApplicationForm must be used within an ApplicationFormProvider");
  }
  return context;
}

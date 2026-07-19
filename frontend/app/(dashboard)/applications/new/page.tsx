"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationFormProvider, useApplicationForm } from "@/lib/contexts/ApplicationFormContext";
import { StepIndicator } from "@/components/form/StepIndicator";
import { FormInput, FormSelect } from "@/components/form/FormInput";
import { CustomDatePicker } from "@/components/form/CustomDatePicker";
import { apiRequest } from "@/lib/api";

const STEPS = ["Basic Info", "Financials", "Loan Details"];

function ApplicationFormContent() {
  const router = useRouter();
  const { formData, updateFormData, currentStep, setStep, nextStep, prevStep } = useApplicationForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      nextStep();
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiRequest("/api/applications", {
        method: "POST",
        json: {
          applicantName: formData.applicantName,
          dateOfBirth: formData.dateOfBirth,
          maritalStatus: formData.maritalStatus,
          numChildren: Number(formData.numChildren),
          employmentType: formData.employmentType,
          employmentDurationYears: Number(formData.employmentDurationYears),
          educationLevel: formData.educationLevel,
          annualIncome: Number(formData.annualIncome),
          ownsVehicle: formData.ownsVehicle === "1",
          ownsRealEstate: formData.ownsRealEstate === "1",
          housingType: formData.housingType,
          numFamilyMembers: Number(formData.numFamilyMembers),
          loanAmount: Number(formData.loanAmount),
          loanTermMonths: Number(formData.loanTermMonths),
        },
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to submit application");
      }

      // Redirect to the results page for this new application
      router.push(`/applications/${payload.data.id}/results`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return !formData.applicantName || !formData.dateOfBirth || !formData.maritalStatus || !formData.employmentType || !formData.educationLevel;
    }
    if (currentStep === 2) {
      return !formData.annualIncome || !formData.housingType || !formData.ownsVehicle || !formData.ownsRealEstate;
    }
    if (currentStep === 3) {
      return !formData.loanAmount || !formData.loanTermMonths || isSubmitting;
    }
    return false;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fade-in py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          New Application
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the applicant's details below. Our ML model will score the risk automatically.
        </p>
      </div>

      <StepIndicator currentStep={currentStep} steps={STEPS} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        {currentStep === 1 && (
          <div className="grid gap-6 sm:grid-cols-2 animate-slide-up">
            <FormInput
              label="Full Name"
              id="applicantName"
              value={formData.applicantName}
              onChange={(e) => updateFormData({ applicantName: e.target.value })}
              placeholder="e.g. John Doe"
              required
              className="sm:col-span-2"
            />
            <CustomDatePicker
              label="Date of Birth"
              id="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={(val) => updateFormData({ dateOfBirth: val })}
              required
            />
            <FormSelect
              label="Marital Status"
              id="maritalStatus"
              value={formData.maritalStatus}
              onChange={(e) => updateFormData({ maritalStatus: e.target.value })}
              required
            >
              <option value="">Select status...</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
              <option value="SEPARATED">Separated</option>
              <option value="WIDOWED">Widowed</option>
            </FormSelect>
            <FormInput
              label="Number of Children"
              id="numChildren"
              type="number"
              min="0"
              value={formData.numChildren}
              onChange={(e) => updateFormData({ numChildren: e.target.value })}
              required
            />
            <FormInput
              label="Number of Family Members"
              id="numFamilyMembers"
              type="number"
              min="1"
              value={formData.numFamilyMembers}
              onChange={(e) => updateFormData({ numFamilyMembers: e.target.value })}
              helperText="Including the applicant"
              required
            />
            <FormSelect
              label="Employment Type"
              id="employmentType"
              value={formData.employmentType}
              onChange={(e) => updateFormData({ employmentType: e.target.value })}
              required
            >
              <option value="">Select type...</option>
              <option value="EMPLOYED">Employed</option>
              <option value="SELF_EMPLOYED">Self Employed</option>
              <option value="PENSIONER">Pensioner</option>
              <option value="GOVERNMENT">Government</option>
              <option value="STUDENT">Student</option>
              <option value="UNEMPLOYED">Unemployed</option>
            </FormSelect>
            <FormInput
              label="Employment Duration (Years)"
              id="employmentDurationYears"
              type="number"
              step="0.1"
              min="0"
              value={formData.employmentDurationYears}
              onChange={(e) => updateFormData({ employmentDurationYears: e.target.value })}
              helperText="How long in current job"
            />
            <FormSelect
              label="Education Level"
              id="educationLevel"
              value={formData.educationLevel}
              onChange={(e) => updateFormData({ educationLevel: e.target.value })}
              required
              className="sm:col-span-2"
            >
              <option value="">Select level...</option>
              <option value="PRIMARY">Primary Education</option>
              <option value="SECONDARY">Secondary Education</option>
              <option value="HIGHER">Higher Education</option>
              <option value="POSTGRADUATE">Postgraduate</option>
            </FormSelect>
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid gap-6 sm:grid-cols-2 animate-slide-up">
            <FormInput
              label="Annual Income (NGN)"
              id="annualIncome"
              type="number"
              min="0"
              value={formData.annualIncome}
              onChange={(e) => updateFormData({ annualIncome: e.target.value })}
              placeholder="e.g. 5000000"
              required
              className="sm:col-span-2"
            />
            <FormSelect
              label="Housing Type"
              id="housingType"
              value={formData.housingType}
              onChange={(e) => updateFormData({ housingType: e.target.value })}
              required
              className="sm:col-span-2"
            >
              <option value="">Select housing...</option>
              <option value="OWNS">Owns House</option>
              <option value="RENTS">Rents</option>
              <option value="WITH_FAMILY">With Family</option>
              <option value="COMPANY_PROVIDED">Company Provided</option>
              <option value="SOCIAL_HOUSING">Social Housing</option>
              <option value="MUNICIPAL">Municipal</option>
            </FormSelect>
            <FormSelect
              label="Owns a Vehicle?"
              id="ownsVehicle"
              value={formData.ownsVehicle}
              onChange={(e) => updateFormData({ ownsVehicle: e.target.value })}
              required
            >
              <option value="">Select...</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </FormSelect>
            <FormSelect
              label="Owns Real Estate?"
              id="ownsRealEstate"
              value={formData.ownsRealEstate}
              onChange={(e) => updateFormData({ ownsRealEstate: e.target.value })}
              required
            >
              <option value="">Select...</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </FormSelect>
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid gap-6 sm:grid-cols-2 animate-slide-up">
            <FormInput
              label="Loan Amount Requested (NGN)"
              id="loanAmount"
              type="number"
              min="0"
              value={formData.loanAmount}
              onChange={(e) => updateFormData({ loanAmount: e.target.value })}
              placeholder="e.g. 1000000"
              required
              className="sm:col-span-2"
            />
            <FormInput
              label="Loan Term (Months)"
              id="loanTermMonths"
              type="number"
              min="1"
              value={formData.loanTermMonths}
              onChange={(e) => updateFormData({ loanTermMonths: e.target.value })}
              placeholder="e.g. 12"
              required
              className="sm:col-span-2"
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isNextDisabled()}
            className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : currentStep === 3 ? (
              "Submit Application"
            ) : (
              "Next Step"
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Confirm Application Details</h2>
              <p className="mt-1 text-sm text-gray-500">Please review the information carefully before submitting.</p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-3">Basic Info</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500">Full Name:</dt><dd className="font-medium text-gray-900">{formData.applicantName}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Date of Birth:</dt><dd className="font-medium text-gray-900">{formData.dateOfBirth}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Marital Status:</dt><dd className="font-medium text-gray-900">{formData.maritalStatus}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Children:</dt><dd className="font-medium text-gray-900">{formData.numChildren}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Family Members:</dt><dd className="font-medium text-gray-900">{formData.numFamilyMembers}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Employment Type:</dt><dd className="font-medium text-gray-900">{formData.employmentType}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Employment Duration:</dt><dd className="font-medium text-gray-900">{formData.employmentDurationYears} years</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Education Level:</dt><dd className="font-medium text-gray-900">{formData.educationLevel}</dd></div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-3">Financials & Loan</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500">Annual Income:</dt><dd className="font-medium text-gray-900">₦{Number(formData.annualIncome).toLocaleString()}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Housing Type:</dt><dd className="font-medium text-gray-900">{formData.housingType}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Owns Vehicle:</dt><dd className="font-medium text-gray-900">{formData.ownsVehicle === "1" ? "Yes" : "No"}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Owns Real Estate:</dt><dd className="font-medium text-gray-900">{formData.ownsRealEstate === "1" ? "Yes" : "No"}</dd></div>
                    <div className="flex justify-between mt-4 pt-4 border-t"><dt className="text-gray-700 font-semibold">Loan Amount:</dt><dd className="font-bold text-[#2563EB]">₦{Number(formData.loanAmount).toLocaleString()}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-700 font-semibold">Loan Term:</dt><dd className="font-bold text-[#2563EB]">{formData.loanTermMonths} months</dd></div>
                  </dl>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-4 bg-gray-50 rounded-b-xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel & Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="rounded-lg bg-[#2563EB] px-6 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors shadow-sm"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <ApplicationFormProvider>
      <ApplicationFormContent />
    </ApplicationFormProvider>
  );
}

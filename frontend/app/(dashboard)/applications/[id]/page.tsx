"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Briefcase, Home, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Application } from "@/lib/types";
import { formatCurrency, formatDate, formatEnumLabel, formatDateTime } from "@/lib/formatters";
import { DecisionBadge } from "@/components/ui/DecisionBadge";
import { RiskScoreDisplay } from "@/components/ui/RiskScoreDisplay";
import { ShapChart } from "@/components/charts/ShapChart";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplication() {
      try {
        const response = await apiRequest(`/api/applications/${id}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "Failed to load application");
        }

        setApplication(payload.data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchApplication();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="mx-auto max-w-3xl pt-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800">Error Loading Application</h3>
          <p className="mt-2 text-sm text-red-600">{error || "Application not found."}</p>
          <button
            onClick={() => router.push("/applications")}
            className="mt-6 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {application.applicantName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Application ID: {application.id} • Submitted {formatDateTime(application.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/applications/${application.id}/results`}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              View Analysis
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Left Column: Data */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section: Personal Info */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">Personal Information</h3>
            </div>
            <div className="px-6 py-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(application.dateOfBirth)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Marital Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatEnumLabel(application.maritalStatus)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Number of Children</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.numChildren}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Family Members</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.numFamilyMembers}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Section: Employment & Income */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">Employment & Income</h3>
            </div>
            <div className="px-6 py-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Employment Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatEnumLabel(application.employmentType)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Duration (Years)</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.employmentDurationYears}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Education Level</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatEnumLabel(application.educationLevel)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Annual Income</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{formatCurrency(application.annualIncome)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Section: Assets & Housing */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">Assets & Housing</h3>
            </div>
            <div className="px-6 py-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Housing Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatEnumLabel(application.housingType)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Owns Vehicle</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.ownsVehicle ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Owns Real Estate</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.ownsRealEstate ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right Column: Risk & Decision */}
        <div className="space-y-6">
          {/* Decision Summary */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">AI Recommendation</h3>
            
            <div className="flex justify-center mb-6">
              <RiskScoreDisplay score={application.riskScore} size="lg" />
            </div>
            
            <div className="flex justify-center mb-6">
              <DecisionBadge decision={application.decision} className="px-4 py-2 text-sm" />
            </div>
            
            {application.adminOverride && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
                This decision was manually overridden by an administrator.
              </div>
            )}
          </div>

          {/* Loan Details */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
             <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">Requested Loan</h3>
            </div>
            <div className="px-6 py-5">
              <dl className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">Amount</dt>
                  <dd className="text-lg font-bold text-gray-900">{formatCurrency(application.loanAmount)}</dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">Term</dt>
                  <dd className="text-sm font-medium text-gray-900">{application.loanTermMonths} months</dd>
                </div>
                <div className="flex justify-between items-center py-2">
                  <dt className="text-sm font-medium text-gray-500">Est. Monthly</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatCurrency(application.loanAmount / application.loanTermMonths)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

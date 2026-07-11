"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Application } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { DecisionBadge } from "@/components/ui/DecisionBadge";
import { RiskScoreDisplay } from "@/components/ui/RiskScoreDisplay";
import { ShapChart } from "@/components/charts/ShapChart";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ResultsPage() {
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
          <h3 className="text-lg font-semibold text-red-800">Error Loading Results</h3>
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
    <div className="mx-auto max-w-4xl space-y-8 animate-slide-up">
      {/* Top Section: Decision Summary */}
      <div className="rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden">
        {/* Banner */}
        <div className={`px-8 py-6 border-b ${
          application.riskScore !== null && application.riskScore > 65 
            ? "bg-red-50 border-red-100" 
            : application.riskScore !== null && application.riskScore > 35 
            ? "bg-amber-50 border-amber-100" 
            : "bg-green-50 border-green-100"
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-1">
                Applicant
              </p>
              <h1 className="text-2xl font-bold text-gray-900">{application.applicantName}</h1>
              <p className="text-sm font-medium text-gray-700 mt-2">
                Requested {formatCurrency(application.loanAmount)} for {application.loanTermMonths} months
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <RiskScoreDisplay score={application.riskScore} size="lg" />
              </div>
              <div className="flex flex-col items-center justify-center gap-2 border-l border-gray-300/50 pl-6 h-20">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Recommendation</p>
                <DecisionBadge decision={application.decision} className="px-4 py-2 text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Explainable AI Section */}
        <div className="px-8 py-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Info className="h-5 w-5 text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Why This Decision Was Made</h2>
              <p className="text-sm text-gray-500 mt-0.5">Top factors influencing the ML risk score (Explainable AI)</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
            <ShapChart values={application.shapValues || []} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Link
            href={`/applications/${application.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
          >
            View Full Application Data
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

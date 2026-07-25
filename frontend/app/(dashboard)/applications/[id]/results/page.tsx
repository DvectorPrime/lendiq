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
    <div className="mx-auto max-w-4xl w-full space-y-8 overflow-hidden animate-slide-up">
      {/* Top Section: Decision Summary */}
      <div className="rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden">
        {/* Premium Banner */}
        <div className={`relative px-4 sm:px-8 py-8 sm:py-10 overflow-hidden ${
          application.riskScore !== null && application.riskScore > 65 
            ? "bg-gradient-to-br from-rose-500 to-red-700" 
            : application.riskScore !== null && application.riskScore > 35 
            ? "bg-gradient-to-br from-amber-400 to-orange-600" 
            : "bg-gradient-to-br from-emerald-500 to-teal-700"
        }`}>
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent mix-blend-overlay"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left text-white w-full md:w-1/2">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-2">
                Applicant Analysis
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 drop-shadow-sm">{application.applicantName}</h1>
              <p className="text-base font-medium text-white/90 bg-white/10 inline-block px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                Requested {formatCurrency(application.loanAmount)} for {application.loanTermMonths} months
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              {/* Glassmorphic Risk Score Card */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-full sm:w-auto">
                <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-3">AI Risk Score</p>
                <div className="bg-white rounded-xl p-2 shadow-inner">
                  <RiskScoreDisplay score={application.riskScore} size="lg" />
                </div>
              </div>
              
              {/* Glassmorphic Recommendation Card */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-full sm:w-auto min-h-[140px]">
                <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-4">Recommendation</p>
                <div className="transform scale-110">
                  <DecisionBadge decision={application.decision} className="px-5 py-2.5 text-sm shadow-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Explainable AI Section */}
        <div className="px-4 sm:px-8 py-6 sm:py-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Info className="h-5 w-5 text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Why This Decision Was Made</h2>
              <p className="text-sm text-gray-500 mt-0.5">Top factors influencing the ML risk score (Explainable AI)</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 sm:p-6 overflow-hidden">
            <ShapChart values={application.shapValues || []} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-4 sm:px-8 py-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
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

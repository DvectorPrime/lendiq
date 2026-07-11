"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Users, Activity, FileCheck } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useApplications } from "@/lib/contexts/ApplicationsContext";
import { StatCard } from "@/components/ui/StatCard";
import { ApplicationTable } from "@/components/tables/ApplicationTable";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const { user } = useAuth();
  const { applications, meta, isLoading, error, fetchApplications } = useApplications();

  useEffect(() => {
    fetchApplications(1, 5); // Fetch only top 5 recent applications for dashboard
  }, [fetchApplications]);

  // Compute stats
  const totalApplications = meta?.total || 0;
  const approvedCount = applications.filter((app) => app.decision === "APPROVED").length;
  const approvalRate = totalApplications > 0 ? Math.round((approvedCount / Math.min(applications.length, 5)) * 100) : 0; // Rough approx since we only have top 5, but good for demo
  
  const scoredApps = applications.filter(app => app.riskScore !== null);
  const avgRiskScore = scoredApps.length > 0
    ? Math.round(scoredApps.reduce((sum, app) => sum + (app.riskScore || 0), 0) / scoredApps.length)
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here is an overview of your recent loan applications.
          </p>
        </div>
        <Link
          href="/applications/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
        >
          <PlusCircle className="h-5 w-5" />
          New Application
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Applications"
          value={isLoading ? "-" : totalApplications}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Recent Approval Rate"
          value={isLoading ? "-" : `${approvalRate}%`}
          icon={<FileCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Avg. Risk Score"
          value={isLoading ? "-" : avgRiskScore}
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      {/* Recent Activity */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          <Link
            href="/applications"
            className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          >
            View all
          </Link>
        </div>
        
        <ApplicationTable
          applications={applications}
          meta={null} // Pass null to hide pagination on dashboard
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

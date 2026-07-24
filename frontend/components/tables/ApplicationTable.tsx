import Link from "next/link";
import { useEffect, useRef, useCallback } from "react";
import { Application, PaginationMeta } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { DecisionBadge } from "../ui/DecisionBadge";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ChevronRight } from "lucide-react";

export function ApplicationTable({
  applications,
  meta,
  isLoading,
  onLoadMore,
}: {
  applications: Application[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  onLoadMore?: () => void;
}) {
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && meta && meta.page < meta.totalPages) {
          if (onLoadMore) onLoadMore();
        }
      });
      
      if (node) observer.current.observe(node);
    },
    [isLoading, meta, onLoadMore]
  );

  if (isLoading && applications.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <EmptyState
        title="No applications found"
        message="You haven't submitted any loan applications yet."
        ctaText="Submit Application"
        ctaHref="/applications/new"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Applicant
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Date Submitted
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Loan Amount
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Risk Score
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Decision
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {applications.map((app, index) => {
              const isLast = index === applications.length - 1;
              return (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors" ref={isLast ? lastElementRef : null}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {app.applicantName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDateTime(app.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatCurrency(app.loanAmount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {app.riskScore !== null ? (
                      <span className={`font-semibold ${app.riskScore >= 65 ? 'text-red-600' : app.riskScore >= 35 ? 'text-amber-600' : 'text-green-600'}`}>
                        {app.riskScore.toFixed(1)}%
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <DecisionBadge decision={app.decision} />
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link href={`/applications/${app.id}`} className="text-[#2563EB] hover:text-[#1D4ED8]">
                      View<span className="sr-only">, {app.applicantName}</span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-4">
        {applications.map((app, index) => {
          const isLast = index === applications.length - 1;
          return (
            <Link href={`/applications/${app.id}`} key={app.id} className="block">
              <div 
                className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 hover:shadow-md active:bg-gray-50 transition-all"
                ref={isLast ? lastElementRef : null}
              >
                {/* Header Row: Name and Badge */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-[15px] font-bold text-gray-900 leading-tight pr-4">{app.applicantName}</h3>
                  <DecisionBadge decision={app.decision} className="shrink-0 mt-0.5" />
                </div>
                
                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Loan Amount</p>
                    <p className="font-bold text-gray-900">{formatCurrency(app.loanAmount)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Default Risk</p>
                    <p className="font-bold text-gray-900">
                      {app.riskScore !== null ? (
                        <span className={`${app.riskScore >= 65 ? 'text-red-600' : app.riskScore >= 35 ? 'text-amber-600' : 'text-green-600'}`}>
                          {app.riskScore.toFixed(1)}%
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center text-xs text-gray-400">
                  <span>Submitted on {formatDateTime(app.createdAt)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Infinite Scroll Loading Indicator */}
      {isLoading && applications.length > 0 && (
        <div className="flex items-center justify-center p-6 bg-transparent">
          <LoadingSpinner />
        </div>
      )}
      
      {/* End of list message */}
      {!isLoading && meta && meta.page >= meta.totalPages && applications.length > 0 && (
        <div className="p-4 text-center text-xs text-gray-400">
          End of results
        </div>
      )}
    </div>
  );
}

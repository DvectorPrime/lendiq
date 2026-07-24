"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import { useApplications } from "@/lib/contexts/ApplicationsContext";
import { ApplicationTable } from "@/components/tables/ApplicationTable";

export default function ApplicationsPage() {
  const { applications, meta, isLoading, error, fetchApplications } = useApplications();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      // Reset to page 1 when search changes, but only if we're actually searching
      if (searchTerm !== debouncedSearch) {
        setCurrentPage(1);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debouncedSearch]);

  // Fetch applications on mount, page change, or debounced search change
  useEffect(() => {
    fetchApplications(currentPage, 20, debouncedSearch, currentPage > 1);
  }, [fetchApplications, currentPage, debouncedSearch]);

  const handleLoadMore = () => {
    if (meta && currentPage < meta.totalPages && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all your submitted loan applications.
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

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Search by applicant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-colors"
          />
        </div>
        <div className="text-sm font-medium text-gray-500 whitespace-nowrap">
          {meta?.total || 0} total applications
        </div>
      </div>

      {/* Table & Mobile Cards */}
      <ApplicationTable
        applications={applications}
        meta={meta}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}

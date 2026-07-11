"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { apiRequest } from "@/lib/api";
import type { Application, PaginationMeta, ApplicationsResponse } from "@/lib/types";

type ApplicationsContextType = {
  applications: Application[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  fetchApplications: (page?: number, limit?: number, search?: string) => Promise<void>;
};

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async (page = 1, limit = 20, search = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const response = await apiRequest(`/api/applications?page=${page}&limit=${limit}${searchParam}`);
      const payload = (await response.json()) as ApplicationsResponse;

      if (!response.ok) {
        throw new Error(payload.message || "Failed to fetch applications");
      }

      setApplications(payload.data);
      setMeta(payload.meta || null);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ApplicationsContext.Provider
      value={{ applications, meta, isLoading, error, fetchApplications }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationsContext);
  if (context === undefined) {
    throw new Error("useApplications must be used within an ApplicationsProvider");
  }
  return context;
}

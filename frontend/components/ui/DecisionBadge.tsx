import { ApplicationDecision } from "@/lib/types";
import { CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";

export function DecisionBadge({ decision, className = "" }: { decision: ApplicationDecision; className?: string }) {
  switch (decision) {
    case "APPROVED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 ${className}`}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approved
        </span>
      );
    case "REJECTED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 ${className}`}>
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </span>
      );
    case "REVIEW":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 ${className}`}>
          <AlertCircle className="h-3.5 w-3.5" />
          Manual Review
        </span>
      );
    case "PENDING_REVIEW":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#2563EB] ring-1 ring-inset ring-blue-600/20 ${className}`}>
          <Clock className="h-3.5 w-3.5" />
          Pending Review
        </span>
      );
    default:
      return null;
  }
}

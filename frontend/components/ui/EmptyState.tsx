import Link from "next/link";
import { FileQuestion } from "lucide-react";

export function EmptyState({
  title,
  message,
  ctaText,
  ctaHref,
}: {
  title: string;
  message: string;
  ctaText?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
        <FileQuestion className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
      {ctaText && ctaHref && (
        <div className="mt-6">
          <Link
            href={ctaHref}
            className="inline-flex items-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            {ctaText}
          </Link>
        </div>
      )}
    </div>
  );
}

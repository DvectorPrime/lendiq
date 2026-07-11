import { ReactNode } from "react";

export function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-3xl font-semibold tracking-tight text-gray-900">{value}</p>
      </div>
    </div>
  );
}

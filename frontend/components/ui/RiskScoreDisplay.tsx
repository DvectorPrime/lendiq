import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function RiskScoreDisplay({ score, size = "md" }: { score: number | null; size?: "sm" | "md" | "lg" }) {
  if (score === null) return <span className="text-gray-400">N/A</span>;

  let colorClass = "text-green-600";
  let bgClass = "bg-green-50";
  let borderClass = "border-green-200";
  
  if (score >= 65) {
    colorClass = "text-red-600";
    bgClass = "bg-red-50";
    borderClass = "border-red-200";
  } else if (score >= 35) {
    colorClass = "text-amber-600";
    bgClass = "bg-amber-50";
    borderClass = "border-amber-200";
  }

  const sizeClasses = {
    sm: "text-lg px-2.5 py-1",
    md: "text-3xl px-4 py-2",
    lg: "text-5xl px-6 py-4"
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center rounded-2xl border ${bgClass} ${borderClass}`}>
      <span className={`font-bold tracking-tight ${colorClass} ${sizeClasses[size]}`}>
        {score.toFixed(1)}
      </span>
      {size === "lg" && (
        <span className={`text-xs font-medium uppercase tracking-wider mb-3 ${colorClass} opacity-80`}>
          Risk Score
        </span>
      )}
    </div>
  );
}

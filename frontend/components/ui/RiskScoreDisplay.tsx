import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function RiskScoreDisplay({ score, size = "md" }: { score: number | null; size?: "sm" | "md" | "lg" }) {
  if (score === null) return <span className="text-gray-400">N/A</span>;

  let colorClass = "text-green-600";
  let bgClass = "bg-green-50";
  let borderClass = "border-green-200";
  let label = "Low Risk";
  
  if (score >= 65) {
    colorClass = "text-red-700";
    bgClass = "bg-red-50";
    borderClass = "border-red-200";
    label = "High Risk";
  } else if (score >= 35) {
    colorClass = "text-amber-700";
    bgClass = "bg-amber-50";
    borderClass = "border-amber-200";
    label = "Medium Risk";
  }

  const sizeClasses = {
    sm: "text-lg px-2.5 py-1",
    md: "text-3xl px-4 py-2",
    lg: "text-5xl px-8 pt-6 pb-2"
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center rounded-2xl border shadow-sm ${bgClass} ${borderClass}`}>
      <span className={`font-black tracking-tighter ${colorClass} ${sizeClasses[size]}`}>
        {score.toFixed(1)}<span className="text-2xl font-bold opacity-75 ml-0.5">%</span>
      </span>
      
      {size === "lg" && (
        <div className="flex flex-col items-center mb-6 mt-1 space-y-2">
          <span className={`text-xs font-bold uppercase tracking-widest ${colorClass} opacity-90`}>
            Default Risk
          </span>
          <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/60 shadow-sm ${colorClass}`}>
            {label}
          </span>
        </div>
      )}
      
      {size !== "lg" && (
        <span className={`text-[10px] font-bold uppercase tracking-wider pb-1 ${colorClass} opacity-80`}>
          {label}
        </span>
      )}
    </div>
  );
}

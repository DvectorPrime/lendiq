import { ShapValue } from "@/lib/types";
import { AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";

export function ShapChart({ values }: { values: ShapValue[] }) {
  if (!values || values.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
        No explanation data available.
      </div>
    );
  }

  // Separate into contributors (increases risk, shap_value > 0) and mitigators (decreases risk, shap_value < 0)
  const contributors = values.filter((v) => v.shap_value > 0).sort((a, b) => b.shap_value - a.shap_value);
  const mitigators = values.filter((v) => v.shap_value < 0).sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));

  // Generate dynamic summary
  const getFeatureName = (featStr: string) => {
    // featStr might be "Loan to Income Ratio 9.8". Let's extract just the text part if possible.
    // The safest way is to just use it as is, or strip trailing numbers if we want to be fancy.
    // Given the Python backend formats it as "Name Value", we'll just use the raw string.
    return `"${featStr.split(' ').filter(word => isNaN(Number(word.replace(/[$,]/g, '')))).join(' ')}"`;
  };

  const topContributor = contributors.length > 0 ? getFeatureName(contributors[0].feature) : null;
  const secondContributor = contributors.length > 1 ? getFeatureName(contributors[1].feature) : null;
  const topMitigator = mitigators.length > 0 ? getFeatureName(mitigators[0].feature) : null;

  let summaryText = "This application has a mix of risk factors.";
  if (topContributor && topMitigator) {
    summaryText = `The primary driver increasing risk is ${topContributor}${secondContributor ? ` and ${secondContributor}` : ''}. However, this is partially mitigated by ${topMitigator}.`;
  } else if (topContributor) {
    summaryText = `The risk score is driven higher primarily by ${topContributor}${secondContributor ? ` and ${secondContributor}` : ''}.`;
  } else if (topMitigator) {
    summaryText = `The risk score is very low, kept down primarily by ${topMitigator}.`;
  }

  return (
    <div className="space-y-6 overflow-hidden animate-fade-in">
      {/* Natural Language Summary */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 p-4 sm:p-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/40 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h3 className="text-base font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </span>
            AI Risk Assessment Summary
          </h3>
          <p className="text-sm text-indigo-800/90 leading-relaxed max-w-3xl">{summaryText}</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1">
        {/* Risk Contributors Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h4 className="font-semibold text-gray-900">Risk Contributors</h4>
          </div>
          
          {contributors.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No significant risk contributors found.</p>
          ) : (
            <div className="space-y-3">
              {contributors.map((item, idx) => {
                const impactPercent = (item.shap_value * 100).toFixed(1);
                return (
                  <div key={idx} className="group relative flex flex-col rounded-xl bg-white border border-gray-100 border-l-4 border-l-rose-500 p-4 shadow-sm transition-all hover:shadow-md hover:border-gray-200 gap-2">
                    <div className="flex items-center justify-between w-full">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700 ring-1 ring-inset ring-rose-600/20">
                        <TrendingUp className="h-3.5 w-3.5" />
                        +{impactPercent}%
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0 w-full">
                      <span className="text-sm font-bold text-gray-900" title={item.feature}>
                        {item.feature}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 leading-relaxed" title={item.description}>
                        {item.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Risk Mitigators Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <h4 className="font-semibold text-gray-900">Risk Mitigators</h4>
          </div>
          
          {mitigators.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No significant risk mitigators found.</p>
          ) : (
            <div className="space-y-3">
              {mitigators.map((item, idx) => {
                const impactPercent = (Math.abs(item.shap_value) * 100).toFixed(1);
                return (
                  <div key={idx} className="group relative flex flex-col rounded-xl bg-white border border-gray-100 border-l-4 border-l-emerald-500 p-4 shadow-sm transition-all hover:shadow-md hover:border-gray-200 gap-2">
                    <div className="flex items-center justify-between w-full">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <TrendingDown className="h-3.5 w-3.5" />
                        -{impactPercent}%
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0 w-full">
                      <span className="text-sm font-bold text-gray-900" title={item.feature}>
                        {item.feature}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 leading-relaxed" title={item.description}>
                        {item.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

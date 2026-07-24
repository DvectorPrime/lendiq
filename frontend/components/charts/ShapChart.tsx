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
    <div className="space-y-6 animate-fade-in">
      {/* Natural Language Summary */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">AI Risk Assessment Summary</h3>
        <p className="text-sm text-blue-800 leading-relaxed">{summaryText}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
                  <div key={idx} className="group relative flex items-center justify-between rounded-lg border border-red-100 bg-red-50/30 p-3 transition-all hover:bg-red-50/80 hover:shadow-sm">
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-gray-900" title={item.feature}>
                        {item.feature}
                      </span>
                      <span className="truncate text-xs text-gray-500" title={item.description}>
                        {item.description}
                      </span>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                      <TrendingUp className="h-3 w-3" />
                      +{impactPercent}%
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
                  <div key={idx} className="group relative flex items-center justify-between rounded-lg border border-green-100 bg-green-50/30 p-3 transition-all hover:bg-green-50/80 hover:shadow-sm">
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-gray-900" title={item.feature}>
                        {item.feature}
                      </span>
                      <span className="truncate text-xs text-gray-500" title={item.description}>
                        {item.description}
                      </span>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                      <TrendingDown className="h-3 w-3" />
                      -{impactPercent}%
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

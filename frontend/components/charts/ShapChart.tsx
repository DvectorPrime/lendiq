import { ShapValue } from "@/lib/types";

export function ShapChart({ values }: { values: ShapValue[] }) {
  if (!values || values.length === 0) {
    return <div className="text-sm text-gray-500">No explanation data available.</div>;
  }

  // Find max absolute value to scale the bars
  const maxAbsValue = Math.max(...values.map((v) => Math.abs(v.shap_value)));

  return (
    <div className="space-y-4">
      {values.map((item, index) => {
        const isPositive = item.shap_value > 0;
        const widthPercentage = Math.max((Math.abs(item.shap_value) / maxAbsValue) * 100, 2);

        // Format feature name (e.g., num__CREDIT_INCOME_RATIO -> Credit Income Ratio)
        const featureName = item.feature
          .replace(/^(num__|cat__)/, "")
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <div key={index} className="flex items-center gap-4">
            {/* Feature Name (Left aligned, fixed width) */}
            <div className="w-1/3 shrink-0 text-right">
              <p className="text-sm font-medium text-gray-900 truncate" title={featureName}>
                {featureName}
              </p>
              <p className="text-xs text-gray-500 truncate" title={item.description}>
                {item.description}
              </p>
            </div>

            {/* Chart Area */}
            <div className="flex w-2/3 items-center relative h-8">
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />

              {/* Bar */}
              <div className="w-full flex">
                {/* Left side (Negative/Green) */}
                <div className="w-1/2 flex justify-end pr-1">
                  {!isPositive && (
                    <div
                      className="h-5 bg-green-500 rounded-l-sm transition-all duration-500"
                      style={{ width: `${widthPercentage}%` }}
                    />
                  )}
                </div>
                
                {/* Right side (Positive/Red) */}
                <div className="w-1/2 flex justify-start pl-1">
                  {isPositive && (
                    <div
                      className="h-5 bg-red-500 rounded-r-sm transition-all duration-500"
                      style={{ width: `${widthPercentage}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-green-500" />
          <span className="text-xs text-gray-600">Decreases Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-red-500" />
          <span className="text-xs text-gray-600">Increases Risk</span>
        </div>
      </div>
    </div>
  );
}

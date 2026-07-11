import { Check } from "lucide-react";

export function StepIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <nav aria-label="Progress" className="mb-14 w-full">
      <ol role="list" className="flex items-center w-full">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;
          const isLast = index === steps.length - 1;

          return (
            <li key={step} className={`relative flex items-center ${!isLast ? "w-full" : ""}`}>
              {/* Circle & Label Container */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 transition-colors z-10 ${
                    isCompleted
                      ? "border-[#2563EB] bg-[#2563EB]"
                      : isCurrent
                      ? "border-[#2563EB] bg-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                  ) : (
                    <span
                      className={`text-sm sm:text-base font-semibold ${
                        isCurrent ? "text-[#2563EB]" : "text-gray-500"
                      }`}
                    >
                      {stepNumber}
                    </span>
                  )}
                </div>
                {/* Text Label perfectly centered below the circle */}
                <div
                  className={`absolute top-12 sm:top-14 whitespace-nowrap text-xs sm:text-sm font-medium ${
                    isCurrent ? "text-[#2563EB]" : isCompleted ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step}
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 mx-2 sm:mx-4 h-0.5 transition-colors">
                  <div className={`h-full w-full ${isCompleted ? "bg-[#2563EB]" : "bg-gray-200"}`} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

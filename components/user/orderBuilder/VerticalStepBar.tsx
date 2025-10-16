import React from "react";
import { Check } from "lucide-react";
import type { Step } from "@/types/orderBuilder";

interface VerticalStepBarProps {
  steps: Step[];
  stepNumber: number;
}

export default function VerticalStepBar({ steps, stepNumber }: VerticalStepBarProps) {
  return (
    <div className="flex flex-col gap-4 min-w-[160px]">
      {steps.map((step, index) => {
        const isActive = stepNumber === step.id;
        const isCompleted = stepNumber > step.id;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-start gap-3">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  isActive
                    ? "bg-dark-blue text-white"
                    : isCompleted
                    ? "bg-green text-white"
                    : "bg-white border-2 border-light-gray-3 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check size={20} />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-12 ${
                    isCompleted ? "bg-green" : "bg-light-gray-3"
                  }`}
                />
              )}
            </div>

            {/* Step name */}
            <div className="flex-1 pt-2">
              <p
                className={`font-semibold ${
                  isActive
                    ? "text-dark-blue"
                    : isCompleted
                    ? "text-green"
                    : "text-gray-400"
                }`}
              >
                {step.name}
              </p>
              {isActive && (
                <p className="text-xs text-gray-500 mt-1">Current step</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


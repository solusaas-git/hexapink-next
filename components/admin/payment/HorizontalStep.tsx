import React from "react";

interface Step {
  label: string;
  number: number;
}

interface HorizontalStepProps {
  steps: Step[];
  currentStep: number;
}

const HorizontalStep: React.FC<HorizontalStepProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="w-full p-4 flex items-center border-b border-dashed border-light-gray-3">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {renderStep(step, index, currentStep)}
          {index < steps.length - 1 && renderDivider(index, currentStep)}
        </React.Fragment>
      ))}
    </div>
  );
};

const renderStep = (step: Step, index: number, currentStep: number) => {
  if (index + 1 === currentStep) {
    return (
      <div className="h-6 pr-3 flex items-center justify-start gap-2 rounded-full border border-light-gray-3 bg-light-gray-1 text-dark-blue text-sm">
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-dark-blue text-white">
          {step.number}
        </div>
        {step.label}
      </div>
    );
  } else if (index + 1 < currentStep) {
    return (
      <div className="w-2 h-2 border-2 border-dark-blue rounded-full"></div>
    );
  } else {
    return (
      <div className="w-2 h-2 border-2 border-light-gray-3 rounded-full"></div>
    );
  }
};

const renderDivider = (index: number, currentStep: number) => {
  const dividerClass =
    index + 1 < currentStep
      ? "flex-1 border-b-2 border-dark-blue"
      : "flex-1 border-b-2 border-light-gray-3";

  return <div className={dividerClass}></div>;
};

export default HorizontalStep;


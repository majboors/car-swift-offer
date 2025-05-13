
import React, { useEffect, useState } from "react";

interface LoadingStep {
  label: string;
  status: "completed" | "active" | "upcoming";
}

interface LoadingContainerProps {
  isLoading: boolean;
  onComplete?: () => void;
  duration?: number;
}

export const LoadingContainer = ({ isLoading, onComplete, duration = 10000 }: LoadingContainerProps) => {
  const initialSteps: LoadingStep[] = [
    { label: "Processing car image...", status: "active" },
    { label: "Using our AI search agent to find latest car details...", status: "upcoming" },
    { label: "Analyzing latest car features...", status: "upcoming" },
    { label: "Formatting features...", status: "upcoming" },
    { label: "Finalizing...", status: "upcoming" },
  ];

  const [steps, setSteps] = useState<LoadingStep[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Reset state when loading changes
  useEffect(() => {
    if (isLoading) {
      setSteps(initialSteps);
      setCurrentStep(0);
      setCompleted(false);
    }
  }, [isLoading]);

  // Only advance steps when loading is true
  useEffect(() => {
    if (!isLoading) return;

    const totalSteps = steps.length;
    const timePerStep = duration / totalSteps;
    
    // Start with first step active
    setSteps(prevSteps => 
      prevSteps.map((step, index) => ({
        ...step,
        status: index === 0 ? "active" : "upcoming",
      }))
    );
    
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => {
        const nextStep = prevStep + 1;
        
        if (nextStep >= totalSteps) {
          clearInterval(interval);
          setCompleted(true);
          onComplete?.();
          return prevStep; // Keep at last step
        }
        
        setSteps((prevSteps) => 
          prevSteps.map((step, index) => ({
            ...step,
            status: 
              index < nextStep
                ? "completed"
                : index === nextStep
                ? "active"
                : "upcoming",
          }))
        );
        
        return nextStep;
      });
    }, timePerStep);

    return () => clearInterval(interval);
  }, [isLoading, steps.length, duration, onComplete]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 touch-manipulation">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-[360px] w-full">
        <h3 className="text-lg font-medium mb-4 text-center">Analyzing Your Car</h3>
        
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li 
              key={index}
              className={`flex items-center py-2 px-4 rounded-md border ${
                step.status === "completed" 
                  ? "border-green-500 text-green-600" 
                  : step.status === "active" 
                  ? "border-blue-500 text-blue-600 font-semibold" 
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {step.status === "active" && (
                <div className="h-3 w-3 mr-2 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
              )}
              {step.status === "completed" && (
                <svg className="h-4 w-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default LoadingContainer;

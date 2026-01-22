import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function OnboardingProgress({ steps, currentStep, completedSteps }) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Getting Started</h2>
        <div className="text-sm text-slate-600">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
      
      <Progress value={progress} className="mb-6" />
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= currentStep 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-200 text-slate-500'
            }`}>
              {completedSteps.has(step.id) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 ${
                index < currentStep ? 'bg-emerald-600' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
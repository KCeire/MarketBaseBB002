import React, { useEffect, useState } from 'react';
import { GuideStep } from '@/app/hooks/useWelcomeGuide';

interface GuideStepProps {
  step: GuideStep;
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  dontShowAgain: boolean;
  setDontShowAgain: (value: boolean) => void;
}

export function GuideStepComponent({
  step,
  currentStep,
  totalSteps,
  isFirstStep,
  isLastStep,
  onNext,
  onPrevious,
  onSkip,
  dontShowAgain,
  setDontShowAgain,
}: GuideStepProps) {
  const [targetPosition, setTargetPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (step.targetElement) {
      const element = document.querySelector(step.targetElement) as HTMLElement;
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
    } else {
      setTargetPosition(null);
    }
  }, [step.targetElement]);

  const getTooltipPosition = () => {
    if (!targetPosition || !step.position) return {};

    const tooltipOffset = 16;

    switch (step.position) {
      case 'top':
        return {
          top: targetPosition.top - tooltipOffset,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: targetPosition.top + targetPosition.height + tooltipOffset,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left - tooltipOffset,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left + targetPosition.width + tooltipOffset,
          transform: 'translate(0, -50%)',
        };
      default:
        return {};
    }
  };

  const getArrowClasses = () => {
    if (!step.position) return '';

    switch (step.position) {
      case 'top':
        return 'absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-gray-800';
      case 'bottom':
        return 'absolute bottom-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-b-white dark:border-b-gray-800';
      case 'left':
        return 'absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-l-white dark:border-l-gray-800';
      case 'right':
        return 'absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-white dark:border-r-gray-800';
      default:
        return '';
    }
  };

  const tooltipStyle = step.targetElement ? getTooltipPosition() : {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  return (
    <>
      {/* Target element highlight */}
      {targetPosition && (
        <div
          className="fixed border-2 border-blue-500 rounded-lg pointer-events-none z-[9998] animate-pulse"
          style={{
            top: targetPosition.top - 4,
            left: targetPosition.left - 4,
            width: targetPosition.width + 8,
            height: targetPosition.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[9999] max-w-sm"
        style={tooltipStyle}
      >
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
          {/* Arrow */}
          {step.position && <div className={getArrowClasses()} />}

          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentStep
                      ? 'bg-blue-600'
                      : i === currentStep - 1
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentStep} of {totalSteps}
            </span>
          </div>

          {/* Content */}
          <div className="mb-4">
            {/* Demo mode warning for welcome step */}
            {step.id === 'welcome' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center text-amber-800 dark:text-amber-200">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-sm">Demo Mode - Under Construction</span>
                  <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {step.content}
            </p>
          </div>

          {/* Don't show again checkbox (only on last step) */}
          {isLastStep && (
            <div className="mb-4">
              <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Don&apos;t show this guide again</span>
              </label>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {!isFirstStep && (
                <button
                  onClick={onPrevious}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={onSkip}
                className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {isLastStep ? 'Close' : 'Skip'}
              </button>

              {!isLastStep && (
                <button
                  onClick={onNext}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Next
                </button>
              )}

              {isLastStep && (
                <button
                  onClick={onNext}
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  Get Started!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
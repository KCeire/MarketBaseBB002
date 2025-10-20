'use client';

import React, { useEffect } from 'react';
import { useWelcomeGuide } from '@/app/hooks/useWelcomeGuide';
import { GuideStepComponent } from './GuideStep';

export function WelcomeGuide() {
  const {
    isActive,
    currentStep,
    totalSteps,
    currentStepData,
    isFirstStep,
    isLastStep,
    dontShowAgain,
    setDontShowAgain,
    nextStep,
    previousStep,
    skipGuide,
  } = useWelcomeGuide();

  // Handle ESC key to close guide (must be before early return)
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isActive) {
        skipGuide();
      }
    };

    if (isActive) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when guide is active
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isActive, skipGuide]);

  if (!isActive) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9997] transition-opacity duration-300"
        onClick={skipGuide}
      />

      {/* Guide Step */}
      <GuideStepComponent
        step={currentStepData}
        currentStep={currentStep}
        totalSteps={totalSteps}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={skipGuide}
        dontShowAgain={dontShowAgain}
        setDontShowAgain={setDontShowAgain}
      />

      {/* Base Batches 002 Badge (only on welcome step) */}
      {isFirstStep && (
        <div className="fixed top-4 right-4 z-[9999]">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Built for Base Batches 002</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Debug component to manually trigger the guide (for development/testing)
export function WelcomeGuideDebug() {
  const { resetGuide } = useWelcomeGuide();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <button
      onClick={resetGuide}
      className="fixed bottom-4 left-4 z-50 bg-red-600 text-white px-3 py-2 rounded-lg text-sm shadow-lg hover:bg-red-700 transition-colors"
      title="Reset Welcome Guide (Dev Only)"
    >
      Reset Guide
    </button>
  );
}
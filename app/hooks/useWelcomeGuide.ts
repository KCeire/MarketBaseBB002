import { useState, useEffect } from 'react';

export interface GuideStep {
  id: string;
  title: string;
  content: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MarketBase!',
    content: 'This onchain marketplace was built with a Base app-first approach. All testing was done to ensure everything works perfectly in the Base app. While it supports anywhere that supports Base network, for the optimal experience, please use the Base app.',
  },
  {
    id: 'shop',
    title: 'Shop Products',
    content: 'Click "Shop" to browse products by category. Pay instantly with USDC - no traditional banking delays!',
  },
  {
    id: 'stores',
    title: 'Explore Stores',
    content: 'Discover "Stores" to explore unique seller storefronts and their curated product collections.',
  },
  {
    id: 'sell',
    title: 'Sell Products',
    content: 'Ready to become a seller? Click "Sell" to open your own store and start listing products. Simple Shopify integration is now functional - just enter your store URL and read-only API info to migrate an existing store.',
  },
  {
    id: 'earn',
    title: 'Earn as Affiliate',
    content: 'Start "Earning" by sharing products and automatically becoming an affiliate. Get rewarded for every sale you help generate!',
  },
  {
    id: 'complete',
    title: "You're All Set!",
    content: 'MarketBase makes onchain commerce simple and rewarding. Built with ❤️ for Base Batches 002.',
  },
];

const STORAGE_KEY = 'marketbase-welcome-guide-completed';

export function useWelcomeGuide() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user has already completed the guide
    const hasCompleted = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!hasCompleted) {
      // Reset current step to 0 in case of stale data
      setCurrentStep(0);
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeGuide();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipGuide = () => {
    completeGuide();
  };

  const completeGuide = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsActive(false);
    setCurrentStep(0);
  };

  const resetGuide = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(0);
    setIsActive(true);
    setDontShowAgain(false);
  };

  const currentStepData = GUIDE_STEPS[currentStep] || GUIDE_STEPS[0];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === GUIDE_STEPS.length - 1;
  const totalSteps = GUIDE_STEPS.length;

  // Reset to first step if current step is out of bounds
  useEffect(() => {
    if (currentStep >= GUIDE_STEPS.length) {
      setCurrentStep(0);
    }
  }, [currentStep]);

  return {
    isActive,
    currentStep: currentStep + 1, // 1-indexed for display
    totalSteps,
    currentStepData,
    isFirstStep,
    isLastStep,
    dontShowAgain,
    setDontShowAgain,
    nextStep,
    previousStep,
    skipGuide,
    completeGuide,
    resetGuide,
  };
}
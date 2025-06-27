import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the onboarding data
interface OnboardingData {
  coachingStyle: string | null;
  conscientiousness: 'planner' | 'adapter' | null;
  regulatoryFocus: 'promotion' | 'prevention' | null;
  locusOfControl: 'internal' | 'external' | null;
  mindset: 'fixed' | 'growth' | null;
  extraversion: number; // 0-100
  agreeableness: number; // 0-100
  currentFocus: string;
}

// Define the shape of the context
interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  resetOnboardingData: () => void;
}

// Initial state for onboarding data
const initialOnboardingData: OnboardingData = {
  coachingStyle: null,
  conscientiousness: null,
  regulatoryFocus: null,
  locusOfControl: null,
  mindset: null,
  extraversion: 50,
  agreeableness: 50,
  currentFocus: '',
};

// Create the context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Create the provider component
export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(initialOnboardingData);

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prevData) => ({ ...prevData, ...data }));
  };

  const resetOnboardingData = () => {
    setOnboardingData(initialOnboardingData);
  };

  return (
    <OnboardingContext.Provider value={{ onboardingData, updateOnboardingData, resetOnboardingData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook to use the onboarding context
export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

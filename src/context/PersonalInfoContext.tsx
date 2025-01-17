import React, { createContext, useContext, useEffect, useState } from 'react';
import type { PersonalInfo } from '../components/PersonalInfoOnboarding';

type PersonalInfoContextType = {
  personalInfo: PersonalInfo | null;
  setPersonalInfo: (info: PersonalInfo | null) => void;
  clearPersonalInfo: () => void;
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
};

const PersonalInfoContext = createContext<PersonalInfoContextType | undefined>(undefined);

export function PersonalInfoProvider({ children }: { children: React.ReactNode }) {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(() => {
    const saved = localStorage.getItem('personalInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => {
    return localStorage.getItem('onboardingComplete') === 'true';
  });

  useEffect(() => {
    if (personalInfo) {
      localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
      localStorage.setItem('onboardingComplete', 'true');
      setIsOnboardingComplete(true);
    }
  }, [personalInfo]);

  const clearPersonalInfo = () => {
    setPersonalInfo(null);
    localStorage.removeItem('personalInfo');
    localStorage.setItem('onboardingComplete', 'false');
    setIsOnboardingComplete(false);
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setIsOnboardingComplete(true);
  };

  return (
    <PersonalInfoContext.Provider
      value={{
        personalInfo,
        setPersonalInfo,
        clearPersonalInfo,
        isOnboardingComplete,
        completeOnboarding
      }}
    >
      {children}
    </PersonalInfoContext.Provider>
  );
}

export function usePersonalInfo() {
  const context = useContext(PersonalInfoContext);
  if (context === undefined) {
    throw new Error('usePersonalInfo must be used within a PersonalInfoProvider');
  }
  return context;
}
import React, { createContext, useContext, useState, useCallback } from 'react';

interface PersonalInfo {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  gender?: string;
  zodiacSign?: string;
}

interface PersonalInfoContextType {
  personalInfo: PersonalInfo | null;
  setPersonalInfo: (info: PersonalInfo) => void;
  clearPersonalInfo: () => void;
  isOnboardingComplete: boolean;
}

const PersonalInfoContext = createContext<PersonalInfoContextType | null>(null);

export const usePersonalInfo = () => {
  const context = useContext(PersonalInfoContext);
  if (!context) {
    throw new Error('usePersonalInfo must be used within a PersonalInfoProvider');
  }
  return context;
};

export const PersonalInfoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [personalInfo, setPersonalInfoState] = useState<PersonalInfo | null>(() => {
    const savedInfo = localStorage.getItem('personalInfo');
    return savedInfo ? JSON.parse(savedInfo) : null;
  });

  const setPersonalInfo = useCallback((info: PersonalInfo) => {
    setPersonalInfoState(info);
    localStorage.setItem('personalInfo', JSON.stringify(info));
  }, []);

  const clearPersonalInfo = useCallback(() => {
    setPersonalInfoState(null);
    localStorage.removeItem('personalInfo');
  }, []);

  const isOnboardingComplete = !!personalInfo;

  return (
    <PersonalInfoContext.Provider
      value={{
        personalInfo,
        setPersonalInfo,
        clearPersonalInfo,
        isOnboardingComplete,
      }}
    >
      {children}
    </PersonalInfoContext.Provider>
  );
};

export default PersonalInfoProvider; 
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePersonalInfo } from '../context/PersonalInfoContext';

interface PersonalInfoGuardProps {
  children: React.ReactNode;
}

export default function PersonalInfoGuard({ children }: PersonalInfoGuardProps) {
  const { isOnboardingComplete, personalInfo } = usePersonalInfo();
  const location = useLocation();

  // 個人情報入力ページにいる場合は、そのまま表示
  if (location.pathname === '/personal-info') {
    return <>{children}</>;
  }

  // 個人情報が未入力の場合は、個人情報入力ページにリダイレクト
  if (!isOnboardingComplete || !personalInfo) {
    return <Navigate to="/personal-info" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 
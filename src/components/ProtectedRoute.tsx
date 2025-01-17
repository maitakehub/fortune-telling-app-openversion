import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { UserRole } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredRole = UserRole.USER,
  requireSubscription = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, checkPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!checkPermission(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireSubscription && !user?.isSubscribed && user?.role !== UserRole.TEST_USER) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
} 
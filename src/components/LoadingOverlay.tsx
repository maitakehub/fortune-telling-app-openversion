import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  blur?: boolean;
}

export function LoadingOverlay({
  isLoading,
  message = 'Loading...',
  blur = true
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        blur ? 'backdrop-blur-sm' : ''
      } bg-black/30`}
    >
      <div className="bg-white/90 rounded-lg shadow-xl p-8 flex flex-col items-center space-y-4">
        <LoadingSpinner size="large" color="#6366f1" />
        {message && (
          <p className="text-gray-700 text-lg font-medium">{message}</p>
        )}
      </div>
    </div>
  );
} 
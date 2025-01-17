import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { subscribeToPlan, getSubscriptionStatus } from './SubscriptionService';

interface SubscriptionState {
  isSubscribed: boolean;
  plan: string;
  startDate: string | null;
  endDate: string | null;
}

interface SubscriptionContextType extends SubscriptionState {
  subscribe: (plan: string) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  plan: 'free',
  startDate: null,
  endDate: null,
  subscribe: async () => {},
  refreshStatus: async () => {},
});

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, token } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [plan, setPlan] = useState('free');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const refreshStatus = async () => {
    if (!isAuthenticated || !token) {
      setIsSubscribed(false);
      setPlan('free');
      setStartDate(null);
      setEndDate(null);
      return;
    }
    try {
      const status = await getSubscriptionStatus(token);
      setIsSubscribed(status.isSubscribed);
      setPlan(status.plan || 'free');
      setStartDate(status.startDate || null);
      setEndDate(status.endDate || null);
    } catch (error) {
      console.error('Failed to refresh subscription status:', error);
    }
  };

  const subscribe = async (planName: string) => {
    if (!isAuthenticated || !token) {
      throw new Error('Not authenticated');
    }
    try {
      await subscribeToPlan(token, planName);
      await refreshStatus();
    } catch (error) {
      console.error('Subscription failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  return (
    <SubscriptionContext.Provider value={{
      isSubscribed,
      plan,
      startDate,
      endDate,
      subscribe,
      refreshStatus
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsTracker } from './tracker';
import { AnalyticsEvent, SyncStatus } from './types';
import { registerServiceWorker } from '@/lib/utils/serviceWorker';

interface AnalyticsContextType {
  trackEvent: (eventType: string, data?: Record<string, any>) => Promise<void>;
  getSyncStatus: () => Promise<SyncStatus | null>;
  getEvents: (limit?: number, offset?: number) => Promise<AnalyticsEvent[]>;
  isInitialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        // Register service worker first
        await registerServiceWorker();

        // Then initialize analytics tracker
        await analyticsTracker.init();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
      }
    };

    initializeAnalytics();

    // Cleanup on unmount
    return () => {
      analyticsTracker.destroy();
    };
  }, []);

  // Track page views when pathname changes
  useEffect(() => {
    if (isInitialized) {
      analyticsTracker.trackPageView(pathname, {
        timestamp: Date.now(),
        title: document.title,
      });
    }
  }, [pathname, isInitialized]);

  const trackEvent = async (eventType: string, data: Record<string, any> = {}) => {
    if (isInitialized) {
      await analyticsTracker.trackCustomEvent(eventType, data);
    }
  };

  const getSyncStatus = async () => {
    return await analyticsTracker.getSyncStatus();
  };

  const getEvents = async (limit?: number, offset?: number) => {
    return await analyticsTracker.getEvents(limit, offset);
  };

  const contextValue: AnalyticsContextType = {
    trackEvent,
    getSyncStatus,
    getEvents,
    isInitialized,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

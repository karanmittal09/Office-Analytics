'use client';

import Link from 'next/link';
import { useAnalytics } from '@/lib/analytics/AnalyticsProvider';
import { useEffect, useState } from 'react';
import { SyncStatus } from '@/lib/analytics/types';

export default function Home() {
  const { trackEvent, getSyncStatus, isInitialized } = useAnalytics();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    const updateSyncStatus = async () => {
      if (isInitialized) {
        const status = await getSyncStatus();
        setSyncStatus(status);
      }
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 5000);
    return () => clearInterval(interval);
  }, [isInitialized, getSyncStatus]);

  const handleStartJourney = async () => {
    await trackEvent('journey_started', {
      startTime: Date.now(),
      source: 'home_page',
    });
  };

  const handleViewAdmin = async () => {
    await trackEvent('admin_accessed', {
      accessTime: Date.now(),
      source: 'home_page',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Offline Analytics Portal
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience our offline-first user journey tracking system. Navigate through 5 pages
            while we capture your interactions, even when you're offline.
          </p>
        </header>

        {/* Sync Status */}
        {syncStatus && (
          <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Connection:</span>
                <span className={`ml-2 px-2 py-1 rounded ${
                  syncStatus.isOnline
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div>
                <span className="font-medium">Pending Events:</span>
                <span className="ml-2">{syncStatus.pendingEvents}</span>
              </div>
              <div>
                <span className="font-medium">Failed Events:</span>
                <span className="ml-2">{syncStatus.failedEvents}</span>
              </div>
              <div>
                <span className="font-medium">Last Sync:</span>
                <span className="ml-2">
                  {syncStatus.lastSyncTime
                    ? new Date(syncStatus.lastSyncTime).toLocaleTimeString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Start User Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Begin the 5-page user journey experience. We'll track your interactions,
              time spent on each page, clicks, and form submissions.
            </p>
            <Link
              href="/journey/page1"
              onClick={handleStartJourney}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Start Journey →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Analytics Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              View comprehensive analytics with advanced filtering, data visualizations,
              and real-time insights from all user interactions.
            </p>
            <Link
              href="/admin"
              onClick={handleViewAdmin}
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              View Analytics →
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Offline-First
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Works seamlessly offline for 24+ hours. All interactions are captured
              locally and synced when connection is restored.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Real-time Sync
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Intelligent background synchronization with conflict resolution
              and retry mechanisms for reliable data integrity.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Rich Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive insights with advanced filtering, visualizations,
              and detailed user journey analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

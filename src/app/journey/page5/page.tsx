'use client';

import Link from 'next/link';
import { useAnalytics } from '@/lib/analytics/AnalyticsProvider';
import { useState, useEffect } from 'react';

export default function JourneyPage5() {
  const { trackEvent, getSyncStatus } = useAnalytics();
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);

  useEffect(() => {
    const completeJourney = async () => {
      await handleInteraction('journey_complete', {
        completionTime: Date.now(),
        totalPages: 5,
        journeyDuration: 'calculated_on_backend'
      });
      setJourneyComplete(true);
    };

    completeJourney();

    // Update sync status
    const updateStatus = async () => {
      const status = await getSyncStatus();
      setSyncStatus(status);
    };
    updateStatus();
    const interval = setInterval(updateStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInteraction = async (type: string, data: any = {}) => {
    await trackEvent(`page5_${type}`, {
      ...data,
      timestamp: Date.now(),
      page: 'journey/page5',
    });
  };

  const handleRestartJourney = async () => {
    await handleInteraction('journey_restart', {
      restartTime: Date.now(),
      previousJourneyComplete: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8 flex justify-between">
          <Link 
            href="/journey/page4"
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => handleInteraction('navigation', { destination: 'page4', direction: 'back' })}
          >
            ← Previous Page
          </Link>
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => handleInteraction('navigation', { destination: 'home' })}
          >
            Home
          </Link>
        </nav>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">✓</div>
            <div className="w-16 h-1 bg-green-600"></div>
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">✓</div>
            <div className="w-16 h-1 bg-green-600"></div>
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">✓</div>
            <div className="w-16 h-1 bg-green-600"></div>
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">✓</div>
            <div className="w-16 h-1 bg-green-600"></div>
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">✓</div>
          </div>
          <p className="text-center mt-2 text-gray-600 dark:text-gray-300">
            Page 5 of 5 - Journey Complete!
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Congratulations!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                You've successfully completed the 5-page user journey. 
                Your entire experience has been tracked and analyzed.
              </p>
            </div>

            {/* Journey Summary */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Journey Summary
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>✓ Page 1: Welcome & Introduction</li>
                  <li>✓ Page 2: User Information & Forms</li>
                  <li>✓ Page 3: Interactive Content & Choices</li>
                  <li>✓ Page 4: Feedback & Rating</li>
                  <li>✓ Page 5: Journey Complete</li>
                </ul>
              </div>

              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Data Captured
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Page view timestamps</li>
                  <li>• Time spent on each page</li>
                  <li>• Click interactions</li>
                  <li>• Form submissions</li>
                  <li>• Navigation patterns</li>
                  <li>• User preferences</li>
                </ul>
              </div>
            </div>

            {/* Sync Status */}
            {syncStatus && (
              <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Data Synchronization Status
                </h3>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                      {syncStatus.isOnline ? '🟢' : '🔴'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      {syncStatus.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{syncStatus.pendingEvents || 0}</div>
                    <div className="text-gray-600 dark:text-gray-300">Pending Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{syncStatus.failedEvents || 0}</div>
                    <div className="text-gray-600 dark:text-gray-300">Failed Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {syncStatus.lastSyncTime ? '✓' : '⏳'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      {syncStatus.lastSyncTime ? 'Synced' : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                What's Next?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Explore the analytics dashboard to see detailed insights from your journey, 
                or start a new journey to generate more data.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/admin"
                  onClick={() => handleInteraction('view_analytics', { source: 'journey_complete' })}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  View Analytics Dashboard
                </Link>
                
                <Link
                  href="/journey/page1"
                  onClick={handleRestartJourney}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Start New Journey
                </Link>
                
                <Link
                  href="/"
                  onClick={() => handleInteraction('return_home', { source: 'journey_complete' })}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Return Home
                </Link>
              </div>
            </div>

            {/* Offline Capability Demo */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                🔄 Test Offline Functionality
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Try disconnecting your internet connection and navigating through the journey again. 
                All your interactions will be stored locally and synced when you reconnect!
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                This demonstrates the offline-first architecture with reliable data synchronization.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useAnalytics } from '@/lib/analytics/AnalyticsProvider';
import { useState } from 'react';

export default function JourneyPage1() {
  const { trackEvent } = useAnalytics();
  const [clickCount, setClickCount] = useState(0);

  const handleInteraction = async (type: string, data: any = {}) => {
    await trackEvent(`page1_${type}`, {
      ...data,
      timestamp: Date.now(),
      page: 'journey/page1',
    });
  };

  const handleButtonClick = async () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    await handleInteraction('button_click', { 
      buttonText: 'Interactive Button',
      clickCount: newCount 
    });
  };

  const handleNextPage = async () => {
    await handleInteraction('navigation', { 
      destination: 'page2',
      action: 'next_page' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => handleInteraction('navigation', { destination: 'home' })}
          >
            ← Back to Home
          </Link>
        </nav>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
              5
            </div>
          </div>
          <p className="text-center mt-2 text-gray-600 dark:text-gray-300">
            Page 1 of 5 - Welcome & Introduction
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to Your Journey!
            </h1>
            
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                This is the first page of your user journey experience. We're tracking your 
                interactions in real-time, including:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Time spent on this page</li>
                <li>Button clicks and interactions</li>
                <li>Navigation patterns</li>
                <li>Form submissions (on later pages)</li>
                <li>Scroll behavior and engagement</li>
              </ul>

              <p className="text-lg text-gray-600 dark:text-gray-300 mt-6">
                Try interacting with the elements below to see the analytics system in action!
              </p>
            </div>

            {/* Interactive Elements */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Interactive Demo
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Click the button below to generate tracked events:
                </p>
                <button
                  onClick={handleButtonClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Interactive Button (Clicked: {clickCount})
                </button>
              </div>

              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Offline Capability
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Try disconnecting your internet - the tracking continues seamlessly!
                </p>
                <div className="text-sm text-green-600 dark:text-green-400">
                  ✓ All interactions stored locally<br/>
                  ✓ Automatic sync when reconnected<br/>
                  ✓ No data loss guaranteed
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ready to continue your journey? Let's move to the next page!
              </p>
              <Link
                href="/journey/page2"
                onClick={handleNextPage}
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Continue to Page 2 →
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              What's Being Tracked?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <strong>Page Events:</strong><br/>
                • Page view timestamp<br/>
                • Time on page<br/>
                • Exit/navigation events
              </div>
              <div>
                <strong>User Interactions:</strong><br/>
                • Button clicks<br/>
                • Link navigation<br/>
                • Element interactions
              </div>
              <div>
                <strong>Session Data:</strong><br/>
                • User agent<br/>
                • Referrer information<br/>
                • Session duration
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

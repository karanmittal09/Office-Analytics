'use client';

import Link from 'next/link';
import { useAnalytics } from '@/lib/analytics/AnalyticsProvider';
import { useState, useEffect } from 'react';

export default function JourneyPage3() {
  const { trackEvent } = useAnalytics();
  const [selectedOption, setSelectedOption] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInteraction = async (type: string, data: any = {}) => {
    await trackEvent(`page3_${type}`, {
      ...data,
      timestamp: Date.now(),
      page: 'journey/page3',
      timeSpentOnPage: timeSpent,
    });
  };

  const handleOptionSelect = async (option: string) => {
    setSelectedOption(option);
    await handleInteraction('option_select', { selectedOption: option });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-900 dark:to-yellow-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8 flex justify-between">
          <Link 
            href="/journey/page2"
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => handleInteraction('navigation', { destination: 'page2', direction: 'back' })}
          >
            ← Previous Page
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Time on page: {timeSpent}s
          </div>
        </nav>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">✓</div>
            <div className="w-16 h-1 bg-green-600"></div>
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">✓</div>
            <div className="w-16 h-1 bg-green-600"></div>
            <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">4</div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">5</div>
          </div>
          <p className="text-center mt-2 text-gray-600 dark:text-gray-300">
            Page 3 of 5 - Interactive Content & Choices
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Make Your Choice
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              This page demonstrates choice tracking and engagement analytics. 
              Your selection patterns help us understand user preferences.
            </p>

            {/* Choice Options */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                { id: 'analytics', title: 'Advanced Analytics', desc: 'Deep insights and data visualization' },
                { id: 'realtime', title: 'Real-time Tracking', desc: 'Live user behavior monitoring' },
                { id: 'offline', title: 'Offline Capabilities', desc: 'Works without internet connection' },
                { id: 'privacy', title: 'Privacy First', desc: 'GDPR compliant data handling' }
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOption === option.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {option.desc}
                  </p>
                  {selectedOption === option.id && (
                    <div className="mt-3 text-orange-600 font-medium">
                      ✓ Selected
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Interactive Elements */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Engagement Tracking
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Time Tracking:</strong><br/>
                  • Page load time<br/>
                  • Time to first interaction<br/>
                  • Total engagement time
                </div>
                <div>
                  <strong>Choice Analytics:</strong><br/>
                  • Option selection patterns<br/>
                  • Decision time analysis<br/>
                  • Preference clustering
                </div>
                <div>
                  <strong>Behavior Insights:</strong><br/>
                  • Click heat mapping<br/>
                  • Scroll depth tracking<br/>
                  • Attention patterns
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="text-center">
              <Link
                href="/journey/page4"
                onClick={() => handleInteraction('navigation', { 
                  destination: 'page4', 
                  direction: 'forward',
                  selectedOption,
                  timeSpent 
                })}
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Continue to Page 4 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

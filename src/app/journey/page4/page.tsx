'use client';

import Link from 'next/link';
import { useAnalytics } from '@/lib/analytics/AnalyticsProvider';
import { useState } from 'react';

export default function JourneyPage4() {
  const { trackEvent } = useAnalytics();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleInteraction = async (type: string, data: any = {}) => {
    await trackEvent(`page4_${type}`, {
      ...data,
      timestamp: Date.now(),
      page: 'journey/page4',
    });
  };

  const handleRating = async (value: number) => {
    setRating(value);
    await handleInteraction('rating_select', { rating: value });
  };

  const handleRatingHover = async (value: number) => {
    setHoveredRating(value);
    await handleInteraction('rating_hover', { hoveredRating: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8 flex justify-between">
          <Link 
            href="/journey/page3"
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => handleInteraction('navigation', { destination: 'page3', direction: 'back' })}
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
            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">5</div>
          </div>
          <p className="text-center mt-2 text-gray-600 dark:text-gray-300">
            Page 4 of 5 - Feedback & Rating
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Rate Your Experience
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              This page captures detailed feedback analytics including rating interactions, 
              hover patterns, and sentiment analysis.
            </p>

            {/* Rating System */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                How would you rate this experience?
              </h3>
              <div className="flex justify-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => handleRatingHover(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className={`text-4xl transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  You rated: {rating} star{rating !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Feedback Categories */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  What We Track
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Star rating selections</li>
                  <li>• Hover patterns on ratings</li>
                  <li>• Time to make decision</li>
                  <li>• Rating change patterns</li>
                  <li>• Feedback completion rates</li>
                </ul>
              </div>

              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Analytics Insights
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• User satisfaction trends</li>
                  <li>• Rating distribution analysis</li>
                  <li>• Feedback sentiment scoring</li>
                  <li>• Experience correlation mapping</li>
                  <li>• Improvement opportunity identification</li>
                </ul>
              </div>
            </div>

            {/* Quick Feedback Buttons */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Quick Feedback (Click any that apply)
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  'Easy to use', 'Fast loading', 'Great design', 'Helpful content',
                  'Works offline', 'Good navigation', 'Clear instructions', 'Responsive'
                ].map((feedback) => (
                  <button
                    key={feedback}
                    onClick={() => handleInteraction('quick_feedback', { feedback })}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-full text-sm transition-colors"
                  >
                    {feedback}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Metrics Display */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Your Journey So Far
              </h3>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">4</div>
                  <div className="text-gray-600 dark:text-gray-300">Pages Visited</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">~2min</div>
                  <div className="text-gray-600 dark:text-gray-300">Time Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">15+</div>
                  <div className="text-gray-600 dark:text-gray-300">Interactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">100%</div>
                  <div className="text-gray-600 dark:text-gray-300">Data Captured</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="text-center">
              <Link
                href="/journey/page5"
                onClick={() => handleInteraction('navigation', { 
                  destination: 'page5', 
                  direction: 'forward',
                  rating,
                  completedFeedback: true
                })}
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Final Page →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

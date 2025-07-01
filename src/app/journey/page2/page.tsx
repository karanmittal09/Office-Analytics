'use client';

import Link from 'next/link';
import { useAnalytics } from '@/lib/analytics/AnalyticsProvider';
import { useState } from 'react';

export default function JourneyPage2() {
  const { trackEvent } = useAnalytics();
  const [formData, setFormData] = useState({ name: '', email: '', feedback: '' });

  const handleInteraction = async (type: string, data: any = {}) => {
    await trackEvent(`page2_${type}`, {
      ...data,
      timestamp: Date.now(),
      page: 'journey/page2',
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleInteraction('form_submit', { 
      formType: 'user_info',
      hasName: !!formData.name,
      hasEmail: !!formData.email,
      hasFeedback: !!formData.feedback,
      fieldCount: Object.values(formData).filter(v => v).length
    });
    alert('Form submitted! (This is just a demo)');
  };

  const handleInputChange = async (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    await handleInteraction('form_input', { field, hasValue: !!value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8 flex justify-between">
          <Link 
            href="/journey/page1"
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => handleInteraction('navigation', { destination: 'page1', direction: 'back' })}
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
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
              ✓
            </div>
            <div className="w-16 h-1 bg-green-600"></div>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
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
            Page 2 of 5 - User Information & Forms
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Tell Us About Yourself
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              This page demonstrates form tracking capabilities. Every form interaction 
              is captured, including field focus, input changes, and submissions.
            </p>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Feedback
                </label>
                <textarea
                  id="feedback"
                  rows={4}
                  value={formData.feedback}
                  onChange={(e) => handleInputChange('feedback', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Share your thoughts about this experience..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Submit Form
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: '', email: '', feedback: '' });
                    handleInteraction('form_reset');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Interactive Elements */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Form Analytics
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Field interaction tracking</li>
                <li>• Form completion rates</li>
                <li>• Abandonment analysis</li>
                <li>• Input validation events</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Privacy First
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• No sensitive data stored</li>
                <li>• Only interaction patterns tracked</li>
                <li>• GDPR compliant approach</li>
                <li>• User consent respected</li>
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center">
            <Link
              href="/journey/page3"
              onClick={() => handleInteraction('navigation', { destination: 'page3', direction: 'forward' })}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Continue to Page 3 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

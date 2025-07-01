'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnalyticsEvent, AnalyticsInsight, AnalyticsFilter } from '@/lib/analytics/types';
import { useAnalytics } from '@/lib/analytics/AnalyticsProvider';

export default function AdminDashboard() {
  const { trackEvent } = useAnalytics();
  const [insights, setInsights] = useState<AnalyticsInsight | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AnalyticsFilter>({
    limit: 50,
    offset: 0,
  });

  useEffect(() => {
    trackEvent('admin_dashboard_view', {
      timestamp: Date.now(),
      source: 'direct_access',
    });
    
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load insights
      const insightsResponse = await fetch('/api/analytics/insights');
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData.insights);
      }

      // Load recent events
      const eventsResponse = await fetch(`/api/analytics/events?limit=${filter.limit}&offset=${filter.offset}`);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: Partial<AnalyticsFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive insights from user journey tracking
            </p>
          </div>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Key Metrics */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {insights.totalEvents.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Users</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {insights.uniqueUsers.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sessions</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {insights.totalSessions.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Session Duration</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {Math.round(insights.averageSessionDuration / 1000)}s
              </p>
            </div>
          </div>
        )}

        {/* Charts and Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Pages */}
          {insights && insights.topPages.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Pages
              </h3>
              <div className="space-y-3">
                {insights.topPages.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white ml-2">
                        {page.page}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(page.views / insights.topPages[0].views) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {page.views}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Types */}
          {insights && insights.eventsByType.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Event Types
              </h3>
              <div className="space-y-3">
                {insights.eventsByType.map((eventType, index) => (
                  <div key={eventType.type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white ml-2 capitalize">
                        {eventType.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(eventType.count / insights.eventsByType[0].count) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {eventType.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Events Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Events
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Synced
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {event.page}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {event.userId ? event.userId.substring(0, 8) + '...' : 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        event.synced 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {event.synced ? 'Synced' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {events.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No events found. Start using the application to generate analytics data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

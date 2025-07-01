import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsFilter, AnalyticsInsight } from '@/lib/analytics/types';
import { analyticsDb } from '@/lib/db/analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filter: AnalyticsFilter = {
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      userId: searchParams.get('userId') || undefined,
      sessionId: searchParams.get('sessionId') || undefined,
      page: searchParams.get('page') || undefined,
      eventType: searchParams.get('eventType') || undefined,
    };

    // Get aggregated insights
    const insights = await generateInsights(filter);

    return NextResponse.json({
      success: true,
      insights,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating analytics insights:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateInsights(filter: AnalyticsFilter): Promise<AnalyticsInsight> {
  // Get basic metrics
  const totalEvents = await analyticsDb.getEventsCount(filter);
  const uniqueUsers = await analyticsDb.getUniqueUsersCount(filter);
  const totalSessions = await analyticsDb.getUniqueSessionsCount(filter);
  
  // Get session durations for average calculation
  const sessionDurations = await analyticsDb.getSessionDurations(filter);
  const averageSessionDuration = sessionDurations.length > 0 
    ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length
    : 0;

  // Get top pages
  const topPages = await analyticsDb.getTopPages(filter, 10);

  // Get events by type
  const eventsByType = await analyticsDb.getEventsByType(filter);

  // Get user activity over time (daily aggregation)
  const userActivity = await analyticsDb.getUserActivityOverTime(filter);

  return {
    totalEvents,
    uniqueUsers,
    totalSessions,
    averageSessionDuration,
    topPages,
    eventsByType,
    userActivity,
  };
}

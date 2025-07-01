import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent, AnalyticsFilter } from '@/lib/analytics/types';
import { analyticsDb } from '@/lib/db/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { success: false, error: 'Invalid events data' },
        { status: 400 }
      );
    }

    // Validate and save events
    const validEvents: AnalyticsEvent[] = [];
    const errors: string[] = [];

    for (const event of events) {
      if (validateEvent(event)) {
        validEvents.push(event);
      } else {
        errors.push(`Invalid event: ${event.id || 'unknown'}`);
      }
    }

    if (validEvents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid events to save', errors },
        { status: 400 }
      );
    }

    // Save events to database
    const savedEvents = await analyticsDb.saveEvents(validEvents);
    
    return NextResponse.json({
      success: true,
      message: `Saved ${savedEvents.length} events`,
      syncedEvents: savedEvents.map(e => e.id),
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error saving analytics events:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const events = await analyticsDb.getEvents(filter);
    const totalCount = await analyticsDb.getEventsCount(filter);

    return NextResponse.json({
      success: true,
      events,
      totalCount,
      hasMore: (filter.offset || 0) + events.length < totalCount,
    });

  } catch (error) {
    console.error('Error fetching analytics events:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateEvent(event: any): event is AnalyticsEvent {
  return (
    event &&
    typeof event.id === 'string' &&
    typeof event.sessionId === 'string' &&
    typeof event.type === 'string' &&
    typeof event.page === 'string' &&
    typeof event.timestamp === 'number' &&
    typeof event.data === 'object' &&
    typeof event.synced === 'boolean' &&
    typeof event.retryCount === 'number'
  );
}

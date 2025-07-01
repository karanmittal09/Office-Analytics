import { NextRequest, NextResponse } from 'next/server';
import { Session } from '@/lib/analytics/types';
import { analyticsDb } from '@/lib/db/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessions } = body;

    if (!sessions || !Array.isArray(sessions)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sessions data' },
        { status: 400 }
      );
    }

    // Validate and save sessions
    const validSessions: Session[] = [];
    const errors: string[] = [];

    for (const session of sessions) {
      if (validateSession(session)) {
        validSessions.push(session);
      } else {
        errors.push(`Invalid session: ${session.id || 'unknown'}`);
      }
    }

    if (validSessions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid sessions to save', errors },
        { status: 400 }
      );
    }

    // Save sessions to database
    const savedSessions = await analyticsDb.saveSessions(validSessions);
    
    return NextResponse.json({
      success: true,
      message: `Saved ${savedSessions.length} sessions`,
      savedSessions: savedSessions.map(s => s.id),
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error saving analytics sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('userId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const sessions = await analyticsDb.getSessions({ userId, limit, offset });
    const totalCount = await analyticsDb.getSessionsCount({ userId });

    return NextResponse.json({
      success: true,
      sessions,
      totalCount,
      hasMore: offset + sessions.length < totalCount,
    });

  } catch (error) {
    console.error('Error fetching analytics sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateSession(session: any): session is Session {
  return (
    session &&
    typeof session.id === 'string' &&
    typeof session.startTime === 'number' &&
    typeof session.userAgent === 'string' &&
    typeof session.isActive === 'boolean' &&
    (session.userId === undefined || typeof session.userId === 'string') &&
    (session.endTime === undefined || typeof session.endTime === 'number') &&
    (session.referrer === undefined || typeof session.referrer === 'string')
  );
}

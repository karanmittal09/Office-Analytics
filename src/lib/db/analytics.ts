import Database from 'better-sqlite3';
import path from 'path';
import { AnalyticsEvent, Session, User, AnalyticsFilter } from '@/lib/analytics/types';

class AnalyticsDatabase {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'analytics.db');
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
    // Create events table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT,
        type TEXT NOT NULL,
        page TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        data TEXT NOT NULL,
        synced BOOLEAN DEFAULT 1,
        retry_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        user_agent TEXT NOT NULL,
        referrer TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        first_seen INTEGER NOT NULL,
        last_seen INTEGER NOT NULL,
        session_count INTEGER DEFAULT 1,
        total_time_spent INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
      CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
      CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
      CREATE INDEX IF NOT EXISTS idx_events_page ON events(page);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
    `);
  }

  async saveEvents(events: AnalyticsEvent[]): Promise<AnalyticsEvent[]> {
    const insertEvent = this.db.prepare(`
      INSERT OR REPLACE INTO events 
      (id, session_id, user_id, type, page, timestamp, data, synced, retry_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((events: AnalyticsEvent[]) => {
      for (const event of events) {
        insertEvent.run(
          event.id,
          event.sessionId,
          event.userId || null,
          event.type,
          event.page,
          event.timestamp,
          JSON.stringify(event.data),
          event.synced ? 1 : 0,
          event.retryCount
        );
      }
    });

    insertMany(events);
    return events;
  }

  async getEvents(filter: AnalyticsFilter): Promise<AnalyticsEvent[]> {
    let query = 'SELECT * FROM events WHERE 1=1';
    const params: any[] = [];

    if (filter.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filter.startDate.getTime());
    }

    if (filter.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filter.endDate.getTime());
    }

    if (filter.userId) {
      query += ' AND user_id = ?';
      params.push(filter.userId);
    }

    if (filter.sessionId) {
      query += ' AND session_id = ?';
      params.push(filter.sessionId);
    }

    if (filter.page) {
      query += ' AND page = ?';
      params.push(filter.page);
    }

    if (filter.eventType) {
      query += ' AND type = ?';
      params.push(filter.eventType);
    }

    query += ' ORDER BY timestamp DESC';

    if (filter.limit) {
      query += ' LIMIT ?';
      params.push(filter.limit);
    }

    if (filter.offset) {
      query += ' OFFSET ?';
      params.push(filter.offset);
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      userId: row.user_id,
      type: row.type,
      page: row.page,
      timestamp: row.timestamp,
      data: JSON.parse(row.data),
      synced: Boolean(row.synced),
      retryCount: row.retry_count,
    }));
  }

  async getEventsCount(filter: AnalyticsFilter): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM events WHERE 1=1';
    const params: any[] = [];

    if (filter.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filter.startDate.getTime());
    }

    if (filter.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filter.endDate.getTime());
    }

    if (filter.userId) {
      query += ' AND user_id = ?';
      params.push(filter.userId);
    }

    if (filter.sessionId) {
      query += ' AND session_id = ?';
      params.push(filter.sessionId);
    }

    if (filter.page) {
      query += ' AND page = ?';
      params.push(filter.page);
    }

    if (filter.eventType) {
      query += ' AND type = ?';
      params.push(filter.eventType);
    }

    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as any;
    return result.count;
  }

  async saveSessions(sessions: Session[]): Promise<Session[]> {
    const insertSession = this.db.prepare(`
      INSERT OR REPLACE INTO sessions 
      (id, user_id, start_time, end_time, user_agent, referrer, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((sessions: Session[]) => {
      for (const session of sessions) {
        insertSession.run(
          session.id,
          session.userId || null,
          session.startTime,
          session.endTime || null,
          session.userAgent,
          session.referrer || null,
          session.isActive ? 1 : 0
        );
      }
    });

    insertMany(sessions);
    return sessions;
  }

  async getSessions(filter: { userId?: string; limit?: number; offset?: number }): Promise<Session[]> {
    let query = 'SELECT * FROM sessions WHERE 1=1';
    const params: any[] = [];

    if (filter.userId) {
      query += ' AND user_id = ?';
      params.push(filter.userId);
    }

    query += ' ORDER BY start_time DESC';

    if (filter.limit) {
      query += ' LIMIT ?';
      params.push(filter.limit);
    }

    if (filter.offset) {
      query += ' OFFSET ?';
      params.push(filter.offset);
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      startTime: row.start_time,
      endTime: row.end_time,
      userAgent: row.user_agent,
      referrer: row.referrer,
      isActive: Boolean(row.is_active),
    }));
  }

  async getSessionsCount(filter: { userId?: string }): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM sessions WHERE 1=1';
    const params: any[] = [];

    if (filter.userId) {
      query += ' AND user_id = ?';
      params.push(filter.userId);
    }

    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as any;
    return result.count;
  }

  async getUniqueUsersCount(filter: AnalyticsFilter): Promise<number> {
    let query = 'SELECT COUNT(DISTINCT user_id) as count FROM events WHERE user_id IS NOT NULL';
    const params: any[] = [];

    if (filter.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filter.startDate.getTime());
    }

    if (filter.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filter.endDate.getTime());
    }

    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as any;
    return result.count;
  }

  async getUniqueSessionsCount(filter: AnalyticsFilter): Promise<number> {
    let query = 'SELECT COUNT(DISTINCT session_id) as count FROM events WHERE 1=1';
    const params: any[] = [];

    if (filter.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filter.startDate.getTime());
    }

    if (filter.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filter.endDate.getTime());
    }

    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as any;
    return result.count;
  }

  async getSessionDurations(filter: AnalyticsFilter): Promise<number[]> {
    let query = `
      SELECT (end_time - start_time) as duration 
      FROM sessions 
      WHERE end_time IS NOT NULL AND end_time > start_time
    `;
    const params: any[] = [];

    if (filter.startDate) {
      query += ' AND start_time >= ?';
      params.push(filter.startDate.getTime());
    }

    if (filter.endDate) {
      query += ' AND start_time <= ?';
      params.push(filter.endDate.getTime());
    }

    if (filter.userId) {
      query += ' AND user_id = ?';
      params.push(filter.userId);
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => row.duration);
  }

  async getTopPages(filter: AnalyticsFilter, limit: number = 10): Promise<Array<{ page: string; views: number }>> {
    let query = `
      SELECT page, COUNT(*) as views 
      FROM events 
      WHERE type = 'page_view'
    `;
    const params: any[] = [];

    if (filter.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filter.startDate.getTime());
    }

    if (filter.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filter.endDate.getTime());
    }

    if (filter.userId) {
      query += ' AND user_id = ?';
      params.push(filter.userId);
    }

    query += ' GROUP BY page ORDER BY views DESC LIMIT ?';
    params.push(limit);

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => ({ page: row.page, views: row.views }));
  }

  async getEventsByType(filter: AnalyticsFilter): Promise<Array<{ type: string; count: number }>> {
    let query = 'SELECT type, COUNT(*) as count FROM events WHERE 1=1';
    const params: any[] = [];

    if (filter.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filter.startDate.getTime());
    }

    if (filter.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filter.endDate.getTime());
    }

    if (filter.userId) {
      query += ' AND user_id = ?';
      params.push(filter.userId);
    }

    query += ' GROUP BY type ORDER BY count DESC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => ({ type: row.type, count: row.count }));
  }

  async getUserActivityOverTime(filter: AnalyticsFilter): Promise<Array<{ date: string; users: number; events: number }>> {
    let query = `
      SELECT 
        DATE(timestamp/1000, 'unixepoch') as date,
        COUNT(DISTINCT user_id) as users,
        COUNT(*) as events
      FROM events 
      WHERE user_id IS NOT NULL
    `;
    const params: any[] = [];

    if (filter.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filter.startDate.getTime());
    }

    if (filter.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filter.endDate.getTime());
    }

    query += ' GROUP BY date ORDER BY date DESC LIMIT 30';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => ({ 
      date: row.date, 
      users: row.users, 
      events: row.events 
    }));
  }

  close() {
    this.db.close();
  }
}

// Create data directory if it doesn't exist
import fs from 'fs';
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const analyticsDb = new AnalyticsDatabase();

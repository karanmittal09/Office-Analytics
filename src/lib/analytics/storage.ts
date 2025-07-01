import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { AnalyticsEvent, Session, User, SyncStatus, ConflictResolution } from './types';
import { STORAGE_KEYS } from './config';

interface AnalyticsDB extends DBSchema {
  events: {
    key: string;
    value: AnalyticsEvent;
    indexes: { 'by-timestamp': number; 'by-session': string; 'by-synced': boolean };
  };
  sessions: {
    key: string;
    value: Session;
    indexes: { 'by-timestamp': number };
  };
  users: {
    key: string;
    value: User;
  };
  syncStatus: {
    key: string;
    value: SyncStatus;
  };
  conflicts: {
    key: string;
    value: ConflictResolution;
    indexes: { 'by-timestamp': number };
  };
}

class AnalyticsStorage {
  private db: IDBPDatabase<AnalyticsDB> | null = null;
  private dbName = 'OfflineAnalyticsDB';
  private dbVersion = 1;

  async init(): Promise<void> {
    try {
      this.db = await openDB<AnalyticsDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Events store
          const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
          eventsStore.createIndex('by-timestamp', 'timestamp');
          eventsStore.createIndex('by-session', 'sessionId');
          eventsStore.createIndex('by-synced', 'synced');

          // Sessions store
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionsStore.createIndex('by-timestamp', 'startTime');

          // Users store
          db.createObjectStore('users', { keyPath: 'id' });

          // Sync status store
          db.createObjectStore('syncStatus', { keyPath: 'id' });

          // Conflicts store
          const conflictsStore = db.createObjectStore('conflicts', { keyPath: 'eventId' });
          conflictsStore.createIndex('by-timestamp', 'timestamp');
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      // Fallback to localStorage
    }
  }

  async saveEvent(event: AnalyticsEvent): Promise<void> {
    if (this.db) {
      // Convert boolean to number for IndexedDB compatibility
      const dbEvent = {
        ...event,
        synced: event.synced ? 1 : 0
      };
      await this.db.add('events', dbEvent);
    } else {
      // Fallback to localStorage
      const events = this.getEventsFromLocalStorage();
      events.push(event);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    }
  }

  async getEvents(limit?: number, offset?: number): Promise<AnalyticsEvent[]> {
    if (this.db) {
      const tx = this.db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const index = store.index('by-timestamp');
      
      let cursor = await index.openCursor(null, 'prev');
      const events: AnalyticsEvent[] = [];
      let count = 0;
      let skipped = 0;

      while (cursor && (!limit || count < limit)) {
        if (!offset || skipped >= offset) {
          // Convert numeric synced values back to booleans
          const event = {
            ...cursor.value,
            synced: Boolean(cursor.value.synced)
          };
          events.push(event);
          count++;
        } else {
          skipped++;
        }
        cursor = await cursor.continue();
      }

      return events;
    } else {
      // Fallback to localStorage
      const events = this.getEventsFromLocalStorage();
      const start = offset || 0;
      const end = limit ? start + limit : undefined;
      return events.slice(start, end);
    }
  }

  async getUnsyncedEvents(): Promise<AnalyticsEvent[]> {
    if (this.db) {
      const tx = this.db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const index = store.index('by-synced');
      const dbEvents = await index.getAll(0); // Use 0 instead of false for IndexedDB

      // Convert numeric synced values back to booleans
      return dbEvents.map(event => ({
        ...event,
        synced: Boolean(event.synced)
      }));
    } else {
      // Fallback to localStorage
      const events = this.getEventsFromLocalStorage();
      return events.filter(event => !event.synced);
    }
  }

  async markEventsSynced(eventIds: string[]): Promise<void> {
    if (this.db) {
      const tx = this.db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');

      for (const id of eventIds) {
        const event = await store.get(id);
        if (event) {
          event.synced = 1; // Use 1 instead of true for IndexedDB
          await store.put(event);
        }
      }
    } else {
      // Fallback to localStorage
      const events = this.getEventsFromLocalStorage();
      const updatedEvents = events.map(event =>
        eventIds.includes(event.id) ? { ...event, synced: true } : event
      );
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
    }
  }

  async saveSession(session: Session): Promise<void> {
    if (this.db) {
      await this.db.put('sessions', session);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    if (this.db) {
      const sessions = await this.db.getAll('sessions');
      return sessions.find(s => s.isActive) || null;
    } else {
      const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
      return sessionData ? JSON.parse(sessionData) : null;
    }
  }

  async saveUser(user: User): Promise<void> {
    if (this.db) {
      await this.db.put('users', user);
    } else {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  async getUser(userId: string): Promise<User | null> {
    if (this.db) {
      return await this.db.get('users', userId) || null;
    } else {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      const user = userData ? JSON.parse(userData) : null;
      return user && user.id === userId ? user : null;
    }
  }

  async saveSyncStatus(status: SyncStatus): Promise<void> {
    if (this.db) {
      await this.db.put('syncStatus', { id: 'current', ...status });
    } else {
      localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify(status));
    }
  }

  async getSyncStatus(): Promise<SyncStatus | null> {
    if (this.db) {
      return await this.db.get('syncStatus', 'current') || null;
    } else {
      const statusData = localStorage.getItem(STORAGE_KEYS.SYNC_STATUS);
      return statusData ? JSON.parse(statusData) : null;
    }
  }

  async saveConflict(conflict: ConflictResolution): Promise<void> {
    if (this.db) {
      await this.db.put('conflicts', conflict);
    } else {
      const conflicts = this.getConflictsFromLocalStorage();
      conflicts.push(conflict);
      localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(conflicts));
    }
  }

  async getConflicts(): Promise<ConflictResolution[]> {
    if (this.db) {
      return await this.db.getAll('conflicts');
    } else {
      return this.getConflictsFromLocalStorage();
    }
  }

  async clearOldEvents(olderThan: number): Promise<void> {
    if (this.db) {
      const tx = this.db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const index = store.index('by-timestamp');
      
      let cursor = await index.openCursor(IDBKeyRange.upperBound(olderThan));
      while (cursor) {
        if (cursor.value.synced) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }
    } else {
      const events = this.getEventsFromLocalStorage();
      const filteredEvents = events.filter(event => 
        event.timestamp > olderThan || !event.synced
      );
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(filteredEvents));
    }
  }

  private getEventsFromLocalStorage(): AnalyticsEvent[] {
    const eventsData = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return eventsData ? JSON.parse(eventsData) : [];
  }

  private getConflictsFromLocalStorage(): ConflictResolution[] {
    const conflictsData = localStorage.getItem(STORAGE_KEYS.CONFLICTS);
    return conflictsData ? JSON.parse(conflictsData) : [];
  }
}

export const analyticsStorage = new AnalyticsStorage();

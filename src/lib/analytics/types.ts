export interface AnalyticsEvent {
  id: string;
  sessionId: string;
  userId?: string;
  type: 'page_view' | 'click' | 'form_submission' | 'time_on_page' | 'custom';
  page: string;
  timestamp: number;
  data: Record<string, any>;
  synced: boolean;
  retryCount: number;
}

export interface Session {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  userAgent: string;
  referrer?: string;
  isActive: boolean;
}

export interface User {
  id: string;
  firstSeen: number;
  lastSeen: number;
  sessionCount: number;
  totalTimeSpent: number;
}

export interface AnalyticsConfig {
  apiEndpoint: string;
  batchSize: number;
  syncInterval: number;
  maxRetries: number;
  offlineStorageKey: string;
  enableDebugMode: boolean;
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  sessionId?: string;
  page?: string;
  eventType?: string;
  limit?: number;
  offset?: number;
}

export interface AnalyticsInsight {
  totalEvents: number;
  uniqueUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  eventsByType: Array<{ type: string; count: number }>;
  userActivity: Array<{ date: string; users: number; events: number }>;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number;
  pendingEvents: number;
  failedEvents: number;
  syncInProgress: boolean;
}

export interface ConflictResolution {
  eventId: string;
  localEvent: AnalyticsEvent;
  serverEvent?: AnalyticsEvent;
  resolution: 'keep_local' | 'keep_server' | 'merge' | 'manual';
  timestamp: number;
}

import { AnalyticsConfig } from './types';

export const defaultAnalyticsConfig: AnalyticsConfig = {
  apiEndpoint: '/api/analytics',
  batchSize: 50,
  syncInterval: 30000, // 30 seconds
  maxRetries: 3,
  offlineStorageKey: 'offline_analytics_events',
  enableDebugMode: process.env.NODE_ENV === 'development',
};

export const STORAGE_KEYS = {
  EVENTS: 'offline_analytics_events',
  SESSION: 'offline_analytics_session',
  USER: 'offline_analytics_user',
  SYNC_STATUS: 'offline_analytics_sync_status',
  CONFLICTS: 'offline_analytics_conflicts',
} as const;

export const EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  CLICK: 'click',
  FORM_SUBMISSION: 'form_submission',
  TIME_ON_PAGE: 'time_on_page',
  CUSTOM: 'custom',
} as const;

export const SYNC_STRATEGIES = {
  IMMEDIATE: 'immediate',
  BATCHED: 'batched',
  SCHEDULED: 'scheduled',
} as const;

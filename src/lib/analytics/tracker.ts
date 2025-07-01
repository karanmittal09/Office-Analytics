import { v4 as uuidv4 } from 'uuid';
import { AnalyticsEvent, Session, User, AnalyticsConfig, SyncStatus } from './types';
import { defaultAnalyticsConfig, EVENT_TYPES } from './config';
import { analyticsStorage } from './storage';

class AnalyticsTracker {
  private config: AnalyticsConfig;
  private currentSession: Session | null = null;
  private currentUser: User | null = null;
  private pageStartTime: number = 0;
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...defaultAnalyticsConfig, ...config };
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await analyticsStorage.init();
      await this.initializeSession();
      await this.initializeUser();
      this.setupEventListeners();
      this.startSyncInterval();
      this.isInitialized = true;

      if (this.config.enableDebugMode) {
        console.log('Analytics tracker initialized');
      }
    } catch (error) {
      console.error('Failed to initialize analytics tracker:', error);
    }
  }

  private async initializeSession(): Promise<void> {
    // Check for existing active session
    this.currentSession = await analyticsStorage.getCurrentSession();
    
    if (!this.currentSession || !this.currentSession.isActive) {
      // Create new session
      this.currentSession = {
        id: uuidv4(),
        userId: this.currentUser?.id,
        startTime: Date.now(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
        isActive: true,
      };
      
      await analyticsStorage.saveSession(this.currentSession);
    }
  }

  private async initializeUser(): Promise<void> {
    // Try to get existing user from storage
    const userId = localStorage.getItem('analytics_user_id') || uuidv4();
    localStorage.setItem('analytics_user_id', userId);

    this.currentUser = await analyticsStorage.getUser(userId);
    
    if (!this.currentUser) {
      // Create new user
      this.currentUser = {
        id: userId,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        sessionCount: 1,
        totalTimeSpent: 0,
      };
    } else {
      // Update existing user
      this.currentUser.lastSeen = Date.now();
      this.currentUser.sessionCount += 1;
    }

    await analyticsStorage.saveUser(this.currentUser);
    
    // Update session with user ID
    if (this.currentSession) {
      this.currentSession.userId = this.currentUser.id;
      await analyticsStorage.saveSession(this.currentSession);
    }
  }

  private setupEventListeners(): void {
    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.pageStartTime = Date.now();
      } else {
        this.trackTimeOnPage();
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.trackTimeOnPage();
      this.endSession();
    });

    // Click tracking
    document.addEventListener('click', (event) => {
      this.trackClick(event);
    });

    // Form submission tracking
    document.addEventListener('submit', (event) => {
      this.trackFormSubmission(event);
    });

    // Online/offline status
    window.addEventListener('online', () => {
      this.updateSyncStatus({ isOnline: true });
      this.syncEvents();
    });

    window.addEventListener('offline', () => {
      this.updateSyncStatus({ isOnline: false });
    });
  }

  async trackPageView(page: string, data: Record<string, any> = {}): Promise<void> {
    this.trackTimeOnPage(); // Track time on previous page
    this.pageStartTime = Date.now();

    const event: AnalyticsEvent = {
      id: uuidv4(),
      sessionId: this.currentSession?.id || 'unknown',
      userId: this.currentUser?.id,
      type: EVENT_TYPES.PAGE_VIEW,
      page,
      timestamp: Date.now(),
      data: {
        ...data,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        url: window.location.href,
      },
      synced: false,
      retryCount: 0,
    };

    await this.saveEvent(event);
  }

  private async trackClick(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const id = target.id;
    const className = target.className;
    const text = target.textContent?.slice(0, 100) || '';

    const analyticsEvent: AnalyticsEvent = {
      id: uuidv4(),
      sessionId: this.currentSession?.id || 'unknown',
      userId: this.currentUser?.id,
      type: EVENT_TYPES.CLICK,
      page: window.location.pathname,
      timestamp: Date.now(),
      data: {
        tagName,
        id,
        className,
        text,
        x: event.clientX,
        y: event.clientY,
      },
      synced: false,
      retryCount: 0,
    };

    await this.saveEvent(analyticsEvent);
  }

  private async trackFormSubmission(event: SubmitEvent): Promise<void> {
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const fields: Record<string, any> = {};

    // Collect form field names (not values for privacy)
    for (const [key] of formData.entries()) {
      fields[key] = 'submitted';
    }

    const analyticsEvent: AnalyticsEvent = {
      id: uuidv4(),
      sessionId: this.currentSession?.id || 'unknown',
      userId: this.currentUser?.id,
      type: EVENT_TYPES.FORM_SUBMISSION,
      page: window.location.pathname,
      timestamp: Date.now(),
      data: {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
        fieldCount: Object.keys(fields).length,
        fields,
      },
      synced: false,
      retryCount: 0,
    };

    await this.saveEvent(analyticsEvent);
  }

  private async trackTimeOnPage(): Promise<void> {
    if (this.pageStartTime === 0) return;

    const timeSpent = Date.now() - this.pageStartTime;
    
    if (timeSpent > 1000) { // Only track if more than 1 second
      const event: AnalyticsEvent = {
        id: uuidv4(),
        sessionId: this.currentSession?.id || 'unknown',
        userId: this.currentUser?.id,
        type: EVENT_TYPES.TIME_ON_PAGE,
        page: window.location.pathname,
        timestamp: Date.now(),
        data: {
          timeSpent,
          url: window.location.href,
        },
        synced: false,
        retryCount: 0,
      };

      await this.saveEvent(event);

      // Update user total time spent
      if (this.currentUser) {
        this.currentUser.totalTimeSpent += timeSpent;
        await analyticsStorage.saveUser(this.currentUser);
      }
    }

    this.pageStartTime = 0;
  }

  async trackCustomEvent(eventType: string, data: Record<string, any> = {}): Promise<void> {
    const event: AnalyticsEvent = {
      id: uuidv4(),
      sessionId: this.currentSession?.id || 'unknown',
      userId: this.currentUser?.id,
      type: EVENT_TYPES.CUSTOM,
      page: window.location.pathname,
      timestamp: Date.now(),
      data: {
        customType: eventType,
        ...data,
      },
      synced: false,
      retryCount: 0,
    };

    await this.saveEvent(event);
  }

  private async saveEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await analyticsStorage.saveEvent(event);
      
      if (this.config.enableDebugMode) {
        console.log('Event tracked:', event);
      }

      // Try immediate sync if online
      if (navigator.onLine) {
        this.syncEvents();
      }
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  }

  private async syncEvents(): Promise<void> {
    try {
      const unsyncedEvents = await analyticsStorage.getUnsyncedEvents();
      
      if (unsyncedEvents.length === 0) return;

      const response = await fetch(this.config.apiEndpoint + '/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: unsyncedEvents }),
      });

      if (response.ok) {
        const result = await response.json();
        const syncedEventIds = result.syncedEvents || unsyncedEvents.map(e => e.id);
        await analyticsStorage.markEventsSynced(syncedEventIds);
        
        await this.updateSyncStatus({
          lastSyncTime: Date.now(),
          pendingEvents: 0,
          syncInProgress: false,
        });

        if (this.config.enableDebugMode) {
          console.log(`Synced ${syncedEventIds.length} events`);
        }
      } else {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to sync events:', error);
      await this.updateSyncStatus({
        syncInProgress: false,
        failedEvents: (await analyticsStorage.getUnsyncedEvents()).length,
      });
    }
  }

  private startSyncInterval(): void {
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncEvents();
      }
    }, this.config.syncInterval);
  }

  private async updateSyncStatus(updates: Partial<SyncStatus>): Promise<void> {
    const currentStatus = await analyticsStorage.getSyncStatus() || {
      isOnline: navigator.onLine,
      lastSyncTime: 0,
      pendingEvents: 0,
      failedEvents: 0,
      syncInProgress: false,
    };

    const newStatus = { ...currentStatus, ...updates };
    await analyticsStorage.saveSyncStatus(newStatus);
  }

  private async endSession(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.isActive = false;
      await analyticsStorage.saveSession(this.currentSession);
    }
  }

  async getSyncStatus(): Promise<SyncStatus | null> {
    return await analyticsStorage.getSyncStatus();
  }

  async getEvents(limit?: number, offset?: number): Promise<AnalyticsEvent[]> {
    return await analyticsStorage.getEvents(limit, offset);
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.endSession();
  }
}

export const analyticsTracker = new AnalyticsTracker();

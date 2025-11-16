/**
 * EventJoinNotificationHandler - Handles event join request notifications
 * Processes kind 1105 events with 'event-join-request' tag
 * Displays in-app notifications for incoming event join requests
 */

import { TTLDeduplicator } from '../../utils/TTLDeduplicator';
import { getCachedProfile } from './profileHelper';
import { getUserNostrIdentifiers } from '../../utils/nostr';
import { unifiedNotificationStore } from './UnifiedNotificationStore';
import type { EventJoinNotificationMetadata } from '../../types/unifiedNotifications';

export interface EventJoinNotification {
  id: string;
  type: 'join_request';
  requestId: string;
  requesterId: string;
  requesterName?: string;
  requesterPicture?: string;
  eventId: string;
  eventName: string;
  teamId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export type EventJoinNotificationCallback = (
  notification: EventJoinNotification
) => void;

export class EventJoinNotificationHandler {
  private static instance: EventJoinNotificationHandler;
  private notifications: Map<string, EventJoinNotification> = new Map();
  private callbacks: Set<EventJoinNotificationCallback> = new Set();
  private subscriptionId?: string;
  private isActive: boolean = false;
  private deduplicator = new TTLDeduplicator(3600000, 1000); // 1hr TTL, 1000 max entries

  private constructor() {
    this.loadNotifications();
  }

  static getInstance(): EventJoinNotificationHandler {
    if (!EventJoinNotificationHandler.instance) {
      EventJoinNotificationHandler.instance =
        new EventJoinNotificationHandler();
    }
    return EventJoinNotificationHandler.instance;
  }

  /**
   * Load notifications from storage (via EventJoinRequestService)
   * NOTE: Disabled - EventJoinRequestService removed during migration to daily leaderboards
   */
  private async loadNotifications(): Promise<void> {
    // Event join request system disabled - return early
    console.log('[EventJoinNotifications] Event join request system disabled');
    return;
  }

  /**
   * Convert EventJoinRequest to EventJoinNotification
   * NOTE: Disabled - EventJoinRequestService removed during migration to daily leaderboards
   */
  private async requestToNotification(
    request: any
  ): Promise<EventJoinNotification | null> {
    // Event join request system disabled - return null
    console.log('[EventJoinNotifications] Event join request system disabled');
    return null;
  }

  /**
   * Start listening for event join requests
   * NOTE: Disabled - EventJoinRequestService removed during migration to daily leaderboards
   */
  async startListening(): Promise<void> {
    // Event join request system disabled - return early
    console.log('[EventJoinNotifications] Event join request system disabled');
    return;
  }

  /**
   * Stop listening for event join requests
   * NOTE: Disabled - EventJoinRequestService removed during migration to daily leaderboards
   */
  async stopListening(): Promise<void> {
    // Event join request system disabled - return early
    console.log('[EventJoinNotifications] Event join request system disabled');
    return;
  }

  /**
   * Register callback for new notifications
   */
  onNotification(callback: EventJoinNotificationCallback): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(notification: EventJoinNotification): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error(
          '[EventJoinNotifications] Error in notification callback:',
          error
        );
      }
    });
  }

  /**
   * Get all notifications
   */
  getNotifications(): EventJoinNotification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): number {
    return Array.from(this.notifications.values()).filter((n) => !n.read)
      .length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.notifications.set(notificationId, notification);
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
  }

  /**
   * Remove a notification
   */
  removeNotification(notificationId: string): void {
    this.notifications.delete(notificationId);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications.clear();
    console.log('[EventJoinNotifications] All notifications cleared');
  }

  /**
   * Refresh notifications from event join requests
   */
  async refresh(): Promise<void> {
    await this.loadNotifications();
  }

  /**
   * Publish event join notification to unified store
   */
  private async publishToUnifiedStore(
    notification: EventJoinNotification
  ): Promise<void> {
    try {
      const metadata: EventJoinNotificationMetadata = {
        requestId: notification.requestId,
        eventId: notification.eventId,
        eventName: notification.eventName,
        teamId: notification.teamId,
        requesterId: notification.requesterId,
        requesterName: notification.requesterName,
        requesterPicture: notification.requesterPicture,
        message: notification.message,
      };

      await unifiedNotificationStore.addNotification(
        'event_join_request',
        `${notification.requesterName || 'Someone'} wants to join your event`,
        notification.eventName,
        metadata,
        {
          icon: 'calendar',
          actions: [
            {
              id: 'view_dashboard',
              type: 'view_event_requests',
              label: 'View Requests',
              isPrimary: true,
            },
          ],
          nostrEventId: notification.requestId,
        }
      );
    } catch (error) {
      console.error(
        '[EventJoinNotifications] Failed to publish to unified store:',
        error
      );
    }
  }
}

export const eventJoinNotificationHandler =
  EventJoinNotificationHandler.getInstance();

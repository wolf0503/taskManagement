/**
 * Notifications Service
 * Handles all notification-related API calls
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api-config'
import type { Notification } from '@/lib/types'

export interface GetNotificationsParams {
  page?: number
  limit?: number
  unreadOnly?: boolean
}

export interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}

class NotificationsService {
  /**
   * Get user notifications
   */
  async getNotifications(params?: GetNotificationsParams): Promise<NotificationsResponse> {
    const response = await apiClient.get<NotificationsResponse>(
      API_ENDPOINTS.NOTIFICATIONS.BASE,
      params
    )
    return response.data || { notifications: [], total: 0, unreadCount: 0 }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    )
    return response.data?.count || 0
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId)
    )
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId)
    )
  }
}

export const notificationsService = new NotificationsService()

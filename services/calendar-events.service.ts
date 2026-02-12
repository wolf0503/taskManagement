/**
 * Calendar Events Service
 * Handles API calls for user-created calendar events (stored in backend)
 */

import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"
import type { CalendarEvent, CreateCalendarEventData, UpdateCalendarEventData } from "@/lib/types"

export interface GetCalendarEventsParams {
  /** Start of date range (YYYY-MM-DD). If omitted, no lower bound. */
  startDate?: string
  /** End of date range (YYYY-MM-DD). If omitted, no upper bound. */
  endDate?: string
  /** Limit number of results (default backend limit) */
  limit?: number
}

class CalendarEventsService {
  /**
   * Get calendar events, optionally filtered by date range
   */
  async getEvents(params?: GetCalendarEventsParams): Promise<CalendarEvent[]> {
    const query: Record<string, string | number> = {}
    if (params?.startDate) query.startDate = params.startDate
    if (params?.endDate) query.endDate = params.endDate
    if (params?.limit != null) query.limit = params.limit

    const response = await apiClient.get<CalendarEvent[]>(
      API_ENDPOINTS.CALENDAR.EVENTS,
      Object.keys(query).length ? query : undefined
    )
    return response.data ?? []
  }

  /**
   * Get a single event by ID
   */
  async getEvent(eventId: string): Promise<CalendarEvent> {
    const response = await apiClient.get<CalendarEvent>(
      API_ENDPOINTS.CALENDAR.BY_ID(eventId)
    )
    if (!response.data) throw new Error("Event not found")
    return response.data
  }

  /**
   * Create a new calendar event
   */
  async createEvent(data: CreateCalendarEventData): Promise<CalendarEvent> {
    const response = await apiClient.post<CalendarEvent>(
      API_ENDPOINTS.CALENDAR.EVENTS,
      data
    )
    if (!response.data) throw new Error("Failed to create event")
    return response.data
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: string, data: UpdateCalendarEventData): Promise<CalendarEvent> {
    const response = await apiClient.patch<CalendarEvent>(
      API_ENDPOINTS.CALENDAR.BY_ID(eventId),
      data
    )
    if (!response.data) throw new Error("Failed to update event")
    return response.data
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CALENDAR.BY_ID(eventId))
  }
}

export const calendarEventsService = new CalendarEventsService()

/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1',
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5001',
  TIMEOUT: 30000, // 30 seconds
  TOKEN_REFRESH_BUFFER: 60000, // Refresh token 1 minute before expiration
} as const

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    TWO_FA: {
      ENABLE: '/auth/2fa/enable',
      VERIFY: '/auth/2fa/verify',
      DISABLE: '/auth/2fa/disable',
    },
  },
  // Projects
  PROJECTS: {
    BASE: '/projects',
    BY_ID: (id: string) => `/projects/${id}`,
    STATS: (id: string) => `/projects/${id}/stats`,
    MEMBERS: (id: string) => `/projects/${id}/members`,
    MEMBER_BY_ID: (projectId: string, userId: string) => 
      `/projects/${projectId}/members/${userId}`,
    MEMBER_ROLE: (projectId: string, userId: string) => 
      `/projects/${projectId}/members/${userId}/role`,
  },
  // Tasks
  TASKS: {
    MY_TASKS: '/tasks/my-tasks',
    BY_PROJECT: (projectId: string) => `/tasks/projects/${projectId}/tasks`,
    BY_ID: (taskId: string) => `/tasks/${taskId}`,
    MOVE: (taskId: string) => `/tasks/${taskId}/move`,
    ASSIGN: (taskId: string) => `/tasks/${taskId}/assign`,
    COMPLETE: (taskId: string) => `/tasks/${taskId}/complete`,
    UNCOMPLETE: (taskId: string) => `/tasks/${taskId}/uncomplete`,
  },
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
  // Users (for listing users when adding project members)
  USERS: {
    BASE: '/users',
    LIST: '/users',
  },
  // Calendar events (user-created events for calendar view)
  CALENDAR: {
    EVENTS: '/calendar/events',
    BY_ID: (id: string) => `/calendar/events/${id}`,
  },
  // Health
  HEALTH: '/health',
} as const

/**
 * WebSocket Service
 * Handles real-time communication using Socket.IO
 */

import { io, Socket } from 'socket.io-client'
import { API_CONFIG } from '@/lib/api-config'
import type { Task } from '@/lib/types'

export interface TaskCreatedEvent {
  projectId: string
  task: Task
}

export interface TaskUpdatedEvent {
  projectId: string
  taskId: string
  updates: Partial<Task>
}

export interface TaskDeletedEvent {
  projectId: string
  taskId: string
}

export interface TaskMovedEvent {
  projectId: string
  taskId: string
  columnId: string
  position: number
}

export interface CommentAddedEvent {
  projectId: string
  taskId: string
  comment: any
}

export interface TypingEvent {
  taskId: string
  userName: string
  userId: string
}

export interface PresenceEvent {
  userId: string
  status: 'ONLINE' | 'AWAY' | 'OFFLINE'
}

type WebSocketEventHandler = (...args: any[]) => void

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  /**
   * Connect to WebSocket server
   */
  connect(accessToken: string): void {
    if (this.socket?.connected) {
      return
    }

    this.socket = io(API_CONFIG.WEBSOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
    })

    this.setupEventHandlers()
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Setup default event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      this.handleReconnect()
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.handleReconnect()
    })
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.socket?.connect()
    }, delay)
  }

  /**
   * Join a project room
   */
  joinProject(projectId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join project: WebSocket not connected')
      return
    }

    this.socket.emit('join:project', projectId)
  }

  /**
   * Leave a project room
   */
  leaveProject(projectId: string): void {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('leave:project', projectId)
  }

  /**
   * Update user presence status
   */
  updatePresence(status: 'ONLINE' | 'AWAY' | 'OFFLINE'): void {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('presence:update', status)
  }

  /**
   * Notify typing started
   */
  startTyping(taskId: string, userName: string): void {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('typing:start', { taskId, userName })
  }

  /**
   * Notify typing stopped
   */
  stopTyping(taskId: string): void {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('typing:stop', { taskId })
  }

  /**
   * Listen for task created events
   */
  onTaskCreated(handler: (data: TaskCreatedEvent) => void): void {
    this.socket?.on('task:created', handler)
  }

  /**
   * Listen for task updated events
   */
  onTaskUpdated(handler: (data: TaskUpdatedEvent) => void): void {
    this.socket?.on('task:updated', handler)
  }

  /**
   * Listen for task deleted events
   */
  onTaskDeleted(handler: (data: TaskDeletedEvent) => void): void {
    this.socket?.on('task:deleted', handler)
  }

  /**
   * Listen for task moved events
   */
  onTaskMoved(handler: (data: TaskMovedEvent) => void): void {
    this.socket?.on('task:moved', handler)
  }

  /**
   * Listen for comment added events
   */
  onCommentAdded(handler: (data: CommentAddedEvent) => void): void {
    this.socket?.on('comment:added', handler)
  }

  /**
   * Listen for typing start events
   */
  onTypingStart(handler: (data: TypingEvent) => void): void {
    this.socket?.on('typing:start', handler)
  }

  /**
   * Listen for typing stop events
   */
  onTypingStop(handler: (data: { taskId: string; userId: string }) => void): void {
    this.socket?.on('typing:stop', handler)
  }

  /**
   * Listen for presence updated events
   */
  onPresenceUpdated(handler: (data: PresenceEvent) => void): void {
    this.socket?.on('presence:updated', handler)
  }

  /**
   * Remove event listener
   */
  off(event: string, handler?: WebSocketEventHandler): void {
    if (handler) {
      this.socket?.off(event, handler)
    } else {
      this.socket?.off(event)
    }
  }
}

export const websocketService = new WebSocketService()

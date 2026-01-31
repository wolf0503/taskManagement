/**
 * Tasks Service
 * Handles all task-related API calls
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api-config'
import type { Task, TaskPriority, PaginationMeta } from '@/lib/types'

export interface CreateTaskData {
  title: string
  description?: string
  columnId: string
  priority: TaskPriority
  tags?: string[]
  assigneeId?: string
  dueDate?: string
  estimatedHours?: number
}

export interface UpdateTaskData {
  title?: string
  description?: string
  priority?: TaskPriority
  tags?: string[]
  assigneeId?: string
  dueDate?: string
  estimatedHours?: number
}

export interface MoveTaskData {
  columnId: string
  position: number
}

export interface AssignTaskData {
  assigneeId: string
}

export interface GetTasksParams {
  page?: number
  limit?: number
  search?: string
  priority?: TaskPriority
  assigneeId?: string
  tags?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

class TasksService {
  /**
   * Get all tasks assigned to authenticated user
   */
  async getMyTasks(params?: GetTasksParams): Promise<{
    tasks: Task[]
    meta: PaginationMeta
  }> {
    const response = await apiClient.get<Task[]>(
      API_ENDPOINTS.TASKS.MY_TASKS,
      params
    )
    return {
      tasks: response.data || [],
      meta: response.meta || { page: 1, limit: 20, total: 0, totalPages: 0 }
    }
  }

  /**
   * Get all tasks in a project
   */
  async getProjectTasks(
    projectId: string,
    params?: GetTasksParams
  ): Promise<{
    tasks: Task[]
    meta: PaginationMeta
  }> {
    const response = await apiClient.get<Task[]>(
      API_ENDPOINTS.TASKS.BY_PROJECT(projectId),
      params
    )
    return {
      tasks: response.data || [],
      meta: response.meta || { page: 1, limit: 20, total: 0, totalPages: 0 }
    }
  }

  /**
   * Create a new task in a project
   */
  async createTask(projectId: string, data: CreateTaskData): Promise<Task> {
    const response = await apiClient.post<Task>(
      API_ENDPOINTS.TASKS.BY_PROJECT(projectId),
      data
    )
    return response.data!
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    const response = await apiClient.get<Task>(
      API_ENDPOINTS.TASKS.BY_ID(taskId)
    )
    return response.data!
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    const response = await apiClient.patch<Task>(
      API_ENDPOINTS.TASKS.BY_ID(taskId),
      data
    )
    return response.data!
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TASKS.BY_ID(taskId))
  }

  /**
   * Move task to different column/position
   */
  async moveTask(taskId: string, data: MoveTaskData): Promise<Task> {
    const response = await apiClient.patch<Task>(
      API_ENDPOINTS.TASKS.MOVE(taskId),
      data
    )
    return response.data!
  }

  /**
   * Assign task to a user
   */
  async assignTask(taskId: string, data: AssignTaskData): Promise<Task> {
    const response = await apiClient.patch<Task>(
      API_ENDPOINTS.TASKS.ASSIGN(taskId),
      data
    )
    return response.data!
  }

  /**
   * Mark task as completed
   */
  async completeTask(taskId: string): Promise<Task> {
    const response = await apiClient.patch<Task>(
      API_ENDPOINTS.TASKS.COMPLETE(taskId)
    )
    return response.data!
  }

  /**
   * Mark task as incomplete
   */
  async uncompleteTask(taskId: string): Promise<Task> {
    const response = await apiClient.patch<Task>(
      API_ENDPOINTS.TASKS.UNCOMPLETE(taskId)
    )
    return response.data!
  }
}

export const tasksService = new TasksService()

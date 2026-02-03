/**
 * Columns Service
 * Handles all column-related API calls
 */

import { apiClient } from '@/lib/api-client'
import type { Column } from '@/lib/types'

export interface CreateColumnDTO {
  title: string
  color?: string
  position?: number
}

export interface UpdateColumnDTO {
  title?: string
  color?: string
  position?: number
}

class ColumnsService {
  /**
   * Get all columns for a project
   * @param projectId - Project UUID
   * @param simple - If true, returns columns without tasks (faster)
   */
  async getProjectColumns(projectId: string, simple: boolean = true): Promise<Column[]> {
    const response = await apiClient.get<Column[]>(
      `/projects/${projectId}/columns`,
      { simple: simple.toString() }
    )
    return response.data || []
  }

  /**
   * Create a new column in a project
   */
  async createColumn(projectId: string, data: CreateColumnDTO): Promise<Column> {
    const response = await apiClient.post<Column>(
      `/projects/${projectId}/columns`,
      data
    )
    return response.data!
  }

  /**
   * Update column
   */
  async updateColumn(projectId: string, columnId: string, data: UpdateColumnDTO): Promise<Column> {
    const response = await apiClient.patch<Column>(
      `/projects/${projectId}/columns/${columnId}`,
      data
    )
    return response.data!
  }

  /**
   * Delete column
   */
  async deleteColumn(projectId: string, columnId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/columns/${columnId}`)
  }

  /**
   * Reorder columns
   */
  async reorderColumns(projectId: string, columnIds: string[]): Promise<void> {
    await apiClient.patch(
      `/projects/${projectId}/columns/reorder`,
      { columnIds }
    )
  }
}

export const columnsService = new ColumnsService()

/**
 * Projects Service
 * Handles all project-related API calls
 */

import { apiClient, ApiResponse } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api-config'
import type { Project, ProjectMember, ProjectStats, ProjectRole, PaginationMeta } from '@/lib/types'

export interface CreateProjectData {
  name: string
  description: string
  color: string
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'PLANNING'
  startDate?: string
  endDate?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  color?: string
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'PLANNING'
  startDate?: string
  endDate?: string
}

export interface GetProjectsParams {
  page?: number
  limit?: number
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'PLANNING'
}

export interface AddMemberData {
  userId: string
  role: ProjectRole
}

export interface UpdateMemberRoleData {
  role: ProjectRole
}

class ProjectsService {
  /**
   * Get all projects for authenticated user (optional signal to cancel on unmount)
   */
  async getProjects(
    params?: GetProjectsParams,
    options?: { signal?: AbortSignal }
  ): Promise<{
    projects: Project[]
    meta: PaginationMeta
  }> {
    const response = await apiClient.get<Project[]>(
      API_ENDPOINTS.PROJECTS.BASE,
      params,
      { signal: options?.signal }
    )
    return {
      projects: response.data || [],
      meta: response.meta || { page: 1, limit: 20, total: 0, totalPages: 0 }
    }
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await apiClient.post<Project>(
      API_ENDPOINTS.PROJECTS.BASE,
      data
    )
    return response.data!
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<Project> {
    const response = await apiClient.get<Project>(
      API_ENDPOINTS.PROJECTS.BY_ID(projectId)
    )
    return response.data!
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, data: UpdateProjectData): Promise<Project> {
    const response = await apiClient.patch<Project>(
      API_ENDPOINTS.PROJECTS.BY_ID(projectId),
      data
    )
    return response.data!
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROJECTS.BY_ID(projectId))
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectId: string): Promise<ProjectStats> {
    const response = await apiClient.get<ProjectStats>(
      API_ENDPOINTS.PROJECTS.STATS(projectId)
    )
    return response.data!
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const response = await apiClient.get<ProjectMember[] | { members?: ProjectMember[] }>(
      API_ENDPOINTS.PROJECTS.MEMBERS(projectId)
    )
    const raw = response.data
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === 'object' && Array.isArray((raw as { members?: ProjectMember[] }).members)) {
      return (raw as { members: ProjectMember[] }).members
    }
    return []
  }

  /**
   * Add member to project
   */
  async addMember(projectId: string, data: AddMemberData): Promise<ProjectMember> {
    const response = await apiClient.post<ProjectMember>(
      API_ENDPOINTS.PROJECTS.MEMBERS(projectId),
      data
    )
    return response.data!
  }

  /**
   * Remove member from project
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.PROJECTS.MEMBER_BY_ID(projectId, userId)
    )
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    projectId: string,
    userId: string,
    data: UpdateMemberRoleData
  ): Promise<ProjectMember> {
    const response = await apiClient.patch<ProjectMember>(
      API_ENDPOINTS.PROJECTS.MEMBER_ROLE(projectId, userId),
      data
    )
    return response.data!
  }
}

export const projectsService = new ProjectsService()

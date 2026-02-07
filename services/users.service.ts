/**
 * Users Service
 * Handles user listing for add-member flows (e.g. project members)
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api-config'
import type { User } from '@/lib/types'

class UsersService {
  /**
   * Get all users (for picker when adding project members).
   * Backend: GET /users should return { success: true, data: User[] }
   */
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>(API_ENDPOINTS.USERS.LIST)
    return response.data ?? []
  }
}

export const usersService = new UsersService()

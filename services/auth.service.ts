/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api-config'
import type { User, AuthResponse } from '@/lib/types'

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<User>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
    return response.data!
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    )
    
    // Store access token
    if (response.data?.accessToken) {
      apiClient.setToken(response.data.accessToken)
    }
    
    return response.data!
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    } finally {
      // Clear token regardless of API response
      apiClient.clearAuth()
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME)
    return response.data!
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ accessToken: string }>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    )
    
    if (response.data?.accessToken) {
      apiClient.setToken(response.data.accessToken)
      return response.data.accessToken
    }
    
    throw new Error('Failed to refresh token')
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data)
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data)
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)
  }

  /**
   * Enable two-factor authentication
   */
  async enable2FA(): Promise<{ qrCode: string; secret: string }> {
    const response = await apiClient.post<{ qrCode: string; secret: string }>(
      API_ENDPOINTS.AUTH.TWO_FA.ENABLE
    )
    return response.data!
  }

  /**
   * Verify 2FA code
   */
  async verify2FA(code: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.TWO_FA.VERIFY, { code })
  }

  /**
   * Disable two-factor authentication
   */
  async disable2FA(): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.AUTH.TWO_FA.DISABLE)
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.getToken() !== null
  }
}

export const authService = new AuthService()

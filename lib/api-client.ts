/**
 * API Client
 * Central HTTP client with authentication, error handling, and token refresh
 */

import { API_CONFIG } from './api-config'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: {
    code: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private baseURL: string
  private accessToken: string | null = null
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    
    // Load token from storage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken')
    }
  }

  /**
   * Set access token
   */
  setToken(token: string | null) {
    this.accessToken = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token)
      } else {
        localStorage.removeItem('accessToken')
      }
      
      // Dispatch custom event for auth state changes
      window.dispatchEvent(new CustomEvent('auth-change', { 
        detail: { token, isAuthenticated: !!token } 
      }))
    }
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    return this.accessToken
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.accessToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
    }
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<string> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include', // Send httpOnly cookie
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Token refresh failed')
        }

        const result: ApiResponse<{ accessToken: string }> = await response.json()
        
        if (result.success && result.data?.accessToken) {
          this.setToken(result.data.accessToken)
          return result.data.accessToken
        }

        throw new Error('Invalid refresh response')
      } catch (error) {
        // Clear auth and redirect to login
        this.clearAuth()
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in'
        }
        throw error
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  /**
   * Make HTTP request with automatic token refresh and optional 429 retry
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retried429 = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const isFormData = options.body instanceof FormData
    const headers: Record<string, string> = {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string> || {}),
    }

    // Add authorization header if token exists
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for refresh token
      })

      // Handle 401 - Unauthorized (token expired)
      if (response.status === 401 && this.accessToken) {
        // Try to refresh token
        try {
          await this.refreshAccessToken()
          
          // Retry original request with new token
          const retryHeaders: Record<string, string> = {
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers as Record<string, string> || {}),
            'Authorization': `Bearer ${this.accessToken}`,
          }
          response = await fetch(url, {
            ...options,
            headers: retryHeaders,
            credentials: 'include',
          })
        } catch (refreshError) {
          // Refresh failed, will be handled below
          console.error('Token refresh failed:', refreshError)
        }
      }

      // Handle 429 - Rate limit: retry once after a short wait (skip for auth so user sees error immediately)
      const isAuthEndpoint = /^\/auth\/(login|register|forgot-password|reset-password)/.test(endpoint)
      if (response.status === 429 && !retried429 && !isAuthEndpoint) {
        const retryAfterHeader = response.headers.get('Retry-After')
        const waitSeconds = Math.min(
          retryAfterHeader ? parseInt(retryAfterHeader, 10) || 5 : 5,
          15
        )
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000))
        return this.request<T>(endpoint, options, true)
      }

      // Parse response (429 may return HTML or non-JSON from some servers)
      let data: ApiResponse<T>
      try {
        data = await response.json()
      } catch {
        data = { success: false }
      }

      // Handle error responses
      if (!response.ok || !data.success) {
        const status = response.status
        let message = data.message || 'An error occurred'
        if (status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          if (retryAfter) {
            const seconds = parseInt(retryAfter, 10)
            const minutes = Math.ceil(seconds / 60)
            if (minutes > 1) {
              message = `Too many login attempts. Please wait ${minutes} minutes before trying again.`
            } else {
              message = `Too many login attempts. Please wait ${seconds} seconds before trying again.`
            }
          } else {
            message = 'Too many login attempts. Please wait a few minutes and try again.'
          }
        }
        throw new ApiError(
          status,
          data.error?.code || (status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'UNKNOWN_ERROR'),
          message,
          { ...data.error?.details, retryAfter: response.headers.get('Retry-After') }
        )
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Network or parsing error (e.g. backend not running, wrong API URL, CORS)
      const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch'
      const message = isNetworkError
        ? `Cannot reach the server at ${this.baseURL}. Make sure the backend is running and NEXT_PUBLIC_API_URL in .env.local is correct.`
        : (error instanceof Error ? error.message : 'Network error occurred')
      throw new ApiError(0, 'NETWORK_ERROR', message)
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

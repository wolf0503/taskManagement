"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { websocketService } from '@/services/websocket.service'
import type { User } from '@/lib/types'
import { ApiError } from '@/lib/api-client'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Load user on mount
  useEffect(() => {
    loadUser()
  }, [])

  // Connect/disconnect WebSocket based on auth status
  useEffect(() => {
    if (user && authService.isAuthenticated()) {
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      if (token) {
        websocketService.connect(token)
      }
    } else {
      websocketService.disconnect()
    }

    return () => {
      websocketService.disconnect()
    }
  }, [user])

  const loadUser = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser()
        setUser(userData)
      }
    } catch (err) {
      console.error('Failed to load user:', err)
      // Clear invalid auth
      await authService.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login({ email, password })
      setUser(response.user)
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? (err.statusCode === 429
            ? 'Too many login attempts. Please wait a few minutes and try again.'
            : err.message)
        : 'Login failed. Please check your credentials.'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const userData = await authService.register(data)
      // After registration, automatically log in
      await login(data.email, data.password)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? (err.statusCode === 429
            ? 'Too many attempts. Please wait a few minutes and try again.'
            : err.message)
        : 'Registration failed. Please try again.'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.logout()
      setUser(null)
      router.push('/sign-in')
    } catch (err) {
      console.error('Logout error:', err)
      // Clear local state even if API call fails
      setUser(null)
      router.push('/sign-in')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

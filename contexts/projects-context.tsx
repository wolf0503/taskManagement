"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { projectsService, CreateProjectData, UpdateProjectData } from "@/services/projects.service"
import type { Project, ProjectStatus } from "@/lib/types"
import { ApiError, apiClient } from "@/lib/api-client"

interface ProjectsContextType {
  projects: Project[]
  isLoading: boolean
  error: string | null
  addProject: (project: CreateProjectData) => Promise<Project>
  getProject: (id: string) => Project | undefined
  updateProject: (id: string, updates: UpdateProjectData) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  refreshProjects: () => Promise<void>
  clearError: () => void
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load projects from API
  const loadProjects = useCallback(async () => {
    // Only load projects if user is authenticated
    const token = apiClient.getToken()
    if (!token) {
      // User is not authenticated, don't attempt to load projects
      setProjects([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { projects: fetchedProjects } = await projectsService.getProjects()
      setProjects(fetchedProjects)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to load projects'
      setError(errorMessage)
      console.error('Failed to load projects:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load projects on mount and when authentication changes
  useEffect(() => {
    const token = apiClient.getToken()
    if (token) {
      loadProjects()
    } else {
      // Clear projects if no token
      setProjects([])
    }
  }, []) // Only run on mount

  // Listen for authentication changes
  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ token: string | null; isAuthenticated: boolean }>
      if (customEvent.detail.isAuthenticated) {
        // User logged in, reload projects
        loadProjects()
      } else {
        // User logged out, clear projects
        setProjects([])
        setError(null)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-change', handleAuthChange)
      return () => {
        window.removeEventListener('auth-change', handleAuthChange)
      }
    }
  }, [loadProjects])

  const addProject = async (projectData: CreateProjectData): Promise<Project> => {
    setIsLoading(true)
    setError(null)

    try {
      const newProject = await projectsService.createProject(projectData)
      setProjects((prev) => [...prev, newProject])
      return newProject
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to create project'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getProject = (id: string): Project | undefined => {
    return projects.find((p) => p.id === id)
  }

  const updateProject = async (id: string, updates: UpdateProjectData): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedProject = await projectsService.updateProject(id, updates)
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedProject } : p))
      )
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to update project'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProject = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await projectsService.deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to delete project'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProjects = async (): Promise<void> => {
    await loadProjects()
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isLoading,
        error,
        addProject,
        getProject,
        updateProject,
        deleteProject,
        refreshProjects,
        clearError,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider")
  }
  return context
}

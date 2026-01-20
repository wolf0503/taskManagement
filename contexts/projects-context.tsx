"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Project } from "@/lib/types"

// Default projects data
const defaultProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Redesigning the main website with modern UI/UX principles",
    status: "in-progress",
    color: "bg-chart-1",
    teamMembers: [
      { name: "Alice", avatar: "/professional-woman.png" },
      { name: "Bob", avatar: "/professional-man.png" },
      { name: "Carol", avatar: "/woman-developer.png" },
      { name: "David", avatar: "/man-designer.png" },
    ],
    taskCount: 8,
    completedTasks: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Mobile App",
    description: "Building a cross-platform mobile application",
    status: "in-progress",
    color: "bg-chart-2",
    teamMembers: [
      { name: "Alice", avatar: "/professional-woman.png" },
      { name: "Bob", avatar: "/professional-man.png" },
    ],
    taskCount: 12,
    completedTasks: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Marketing Campaign",
    description: "Q1 marketing campaign planning and execution",
    status: "planning",
    color: "bg-chart-3",
    teamMembers: [
      { name: "Carol", avatar: "/woman-developer.png" },
    ],
    taskCount: 6,
    completedTasks: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "API Development",
    description: "RESTful API development and documentation",
    status: "completed",
    color: "bg-chart-4",
    teamMembers: [
      { name: "David", avatar: "/man-designer.png" },
      { name: "Alice", avatar: "/professional-woman.png" },
    ],
    taskCount: 15,
    completedTasks: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Database Migration",
    description: "Migrating to a new database system",
    status: "on-hold",
    color: "bg-chart-5",
    teamMembers: [
      { name: "Bob", avatar: "/professional-man.png" },
      { name: "Carol", avatar: "/woman-developer.png" },
    ],
    taskCount: 10,
    completedTasks: 3,
    createdAt: new Date().toISOString(),
  },
]

interface ProjectsContextType {
  projects: Project[]
  addProject: (project: Omit<Project, "id" | "createdAt">) => void
  getProject: (id: string) => Project | undefined
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

const STORAGE_KEY = "taskManagement_projects"

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])

  // Load projects from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setProjects(parsed)
        } catch (error) {
          console.error("Failed to parse stored projects:", error)
          setProjects(defaultProjects)
        }
      } else {
        setProjects(defaultProjects)
      }
    }
  }, [])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && projects.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    }
  }, [projects])

  const addProject = (projectData: Omit<Project, "id" | "createdAt">) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString(),
      taskCount: 0,
      completedTasks: 0,
    }
    setProjects((prev) => [...prev, newProject])
  }

  const getProject = (id: string): Project | undefined => {
    return projects.find((p) => p.id === id)
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <ProjectsContext.Provider
      value={{ projects, addProject, getProject, updateProject, deleteProject }}
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

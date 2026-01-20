"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Task } from "@/lib/types"

// Default tasks data for initial projects
const defaultTasksByProject: Record<string, Task[]> = {
  "1": [
    {
      id: "1",
      title: "Design system documentation",
      description: "Create comprehensive docs for the design system components",
      columnId: "todo",
      priority: "high",
      tags: ["Design", "Documentation"],
      assignee: { name: "Alice", avatar: "/professional-woman.png" },
      dueDate: "Jan 20",
      comments: 5,
      attachments: 2,
    },
    {
      id: "2",
      title: "Implement dark mode",
      description: "Add dark mode support across all components",
      columnId: "todo",
      priority: "medium",
      tags: ["Development", "UI"],
      assignee: { name: "Bob", avatar: "/professional-man.png" },
      dueDate: "Jan 22",
      comments: 3,
      attachments: 0,
    },
    {
      id: "3",
      title: "API integration",
      description: "Connect frontend with the new REST API endpoints",
      columnId: "in-progress",
      priority: "high",
      tags: ["Backend", "API"],
      assignee: { name: "Carol", avatar: "/woman-developer.png" },
      dueDate: "Jan 18",
      comments: 8,
      attachments: 4,
    },
    {
      id: "4",
      title: "User authentication flow",
      description: "Implement OAuth and email/password authentication",
      columnId: "in-progress",
      priority: "high",
      tags: ["Security", "Auth"],
      assignee: { name: "David", avatar: "/man-designer.png" },
      dueDate: "Jan 19",
      comments: 12,
      attachments: 1,
    },
    {
      id: "5",
      title: "Performance optimization",
      description: "Optimize bundle size and improve Core Web Vitals",
      columnId: "review",
      priority: "medium",
      tags: ["Performance", "Development"],
      assignee: { name: "Alice", avatar: "/professional-woman.png" },
      dueDate: "Jan 21",
      comments: 6,
      attachments: 3,
    },
    {
      id: "6",
      title: "Mobile responsive design",
      description: "Ensure all pages work flawlessly on mobile devices",
      columnId: "review",
      priority: "low",
      tags: ["Design", "Mobile"],
      assignee: { name: "Bob", avatar: "/professional-man.png" },
      dueDate: "Jan 23",
      comments: 2,
      attachments: 5,
    },
    {
      id: "7",
      title: "Setup CI/CD pipeline",
      description: "Configure automated testing and deployment workflows",
      columnId: "done",
      priority: "high",
      tags: ["DevOps", "Infrastructure"],
      assignee: { name: "Carol", avatar: "/woman-developer.png" },
      dueDate: "Jan 15",
      comments: 10,
      attachments: 2,
    },
    {
      id: "8",
      title: "Logo redesign",
      description: "Create new brand logo variations for different contexts",
      columnId: "done",
      priority: "medium",
      tags: ["Design", "Branding"],
      assignee: { name: "David", avatar: "/man-designer.png" },
      dueDate: "Jan 14",
      comments: 15,
      attachments: 8,
    },
  ],
}

interface TasksContextType {
  getTasks: (projectId: string) => Task[]
  addTask: (projectId: string, task: Omit<Task, "id">) => void
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void
  deleteTask: (projectId: string, taskId: string) => void
  moveTask: (projectId: string, taskId: string, newColumnId: string) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

const STORAGE_KEY = "taskManagement_tasks"

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({})

  // Load tasks from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setTasksByProject(parsed)
        } catch (error) {
          console.error("Failed to parse stored tasks:", error)
          setTasksByProject(defaultTasksByProject)
        }
      } else {
        setTasksByProject(defaultTasksByProject)
      }
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(tasksByProject).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksByProject))
    }
  }, [tasksByProject])

  const getTasks = (projectId: string): Task[] => {
    return tasksByProject[projectId] || []
  }

  const addTask = (projectId: string, taskData: Omit<Task, "id">) => {
    const newTask: Task = {
      ...taskData,
      id: `${projectId}-${Date.now()}`, // Unique ID based on project and timestamp
    }
    setTasksByProject((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newTask],
    }))
  }

  const updateTask = (projectId: string, taskId: string, updates: Partial<Task>) => {
    setTasksByProject((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }))
  }

  const deleteTask = (projectId: string, taskId: string) => {
    setTasksByProject((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter((task) => task.id !== taskId),
    }))
  }

  const moveTask = (projectId: string, taskId: string, newColumnId: string) => {
    setTasksByProject((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map((task) =>
        task.id === taskId ? { ...task, columnId: newColumnId } : task
      ),
    }))
  }

  return (
    <TasksContext.Provider
      value={{ getTasks, addTask, updateTask, deleteTask, moveTask }}
    >
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider")
  }
  return context
}

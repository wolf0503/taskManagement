"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { tasksService, CreateTaskData, UpdateTaskData, MoveTaskData } from "@/services/tasks.service"
import { websocketService } from "@/services/websocket.service"
import type { Task } from "@/lib/types"
import { ApiError } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"

interface TasksContextType {
  tasksByProject: Record<string, Task[]>
  isLoading: boolean
  error: string | null
  getTasks: (projectId: string) => Task[]
  loadProjectTasks: (projectId: string) => Promise<void>
  addTask: (projectId: string, task: CreateTaskData) => Promise<Task>
  updateTask: (taskId: string, updates: UpdateTaskData) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  moveTask: (taskId: string, data: MoveTaskData) => Promise<void>
  completeTask: (taskId: string) => Promise<void>
  uncompleteTask: (taskId: string) => Promise<void>
  clearError: () => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Setup WebSocket listeners for real-time updates
  useEffect(() => {
    // Task created
    websocketService.onTaskCreated((data) => {
      setTasksByProject((prev) => ({
        ...prev,
        [data.projectId]: [...(prev[data.projectId] || []), data.task],
      }))
    })

    // Task updated
    websocketService.onTaskUpdated((data) => {
      setTasksByProject((prev) => ({
        ...prev,
        [data.projectId]: (prev[data.projectId] || []).map((task) =>
          task.id === data.taskId ? { ...task, ...data.updates } : task
        ),
      }))
    })

    // Task deleted
    websocketService.onTaskDeleted((data) => {
      setTasksByProject((prev) => ({
        ...prev,
        [data.projectId]: (prev[data.projectId] || []).filter(
          (task) => task.id !== data.taskId
        ),
      }))
    })

    // Task moved
    websocketService.onTaskMoved((data) => {
      setTasksByProject((prev) => ({
        ...prev,
        [data.projectId]: (prev[data.projectId] || []).map((task) =>
          task.id === data.taskId
            ? { ...task, columnId: data.columnId, position: data.position }
            : task
        ),
      }))
    })

    return () => {
      websocketService.off('task:created')
      websocketService.off('task:updated')
      websocketService.off('task:deleted')
      websocketService.off('task:moved')
    }
  }, [])

  const loadProjectTasks = useCallback(async (projectId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { tasks } = await tasksService.getProjectTasks(projectId, { limit: 1000 })
      setTasksByProject((prev) => ({
        ...prev,
        [projectId]: tasks,
      }))
      
      // Join project room for real-time updates
      websocketService.joinProject(projectId)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to load tasks'
      setError(errorMessage)
      console.error('Failed to load tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTasks = (projectId: string): Task[] => {
    return tasksByProject[projectId] || []
  }

  const addTask = async (projectId: string, taskData: CreateTaskData): Promise<Task> => {
    setIsLoading(true)
    setError(null)

    try {
      const newTask = await tasksService.createTask(projectId, taskData)
      setTasksByProject((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newTask],
      }))
      toast({ title: "Task created", description: "The task has been added." })
      return newTask
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to create task"
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateTask = async (taskId: string, updates: UpdateTaskData): Promise<void> => {
    const previousState = tasksByProject
    setError(null)

    // Optimistic update: apply immediately
    setTasksByProject((prev) => {
      const newState = { ...prev }
      for (const projectId in newState) {
        newState[projectId] = newState[projectId].map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      }
      return newState
    })

    try {
      await tasksService.updateTask(taskId, updates)
      toast({ title: "Task updated", description: "Changes have been saved." })
    } catch (err) {
      setTasksByProject(previousState)
      const errorMessage = err instanceof ApiError ? err.message : "Failed to update task"
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      throw err
    }
  }

  const deleteTask = async (taskId: string): Promise<void> => {
    const previousState = tasksByProject
    setError(null)

    const removedTask = (() => {
      for (const projectId in previousState) {
        const task = previousState[projectId]?.find((t) => t.id === taskId)
        if (task) return { task, projectId }
      }
      return null
    })()

    setTasksByProject((prev) => {
      const newState = { ...prev }
      for (const projectId in newState) {
        newState[projectId] = newState[projectId].filter((t) => t.id !== taskId)
      }
      return newState
    })

    try {
      await tasksService.deleteTask(taskId)
      toast({ title: "Task deleted", description: "The task has been removed." })
    } catch (err) {
      if (removedTask) {
        setTasksByProject((prev) => ({
          ...prev,
          [removedTask.projectId]: [...(prev[removedTask.projectId] || []), removedTask.task],
        }))
      } else {
        setTasksByProject(previousState)
      }
      const errorMessage = err instanceof ApiError ? err.message : "Failed to delete task"
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      throw err
    }
  }

  const moveTask = async (taskId: string, data: MoveTaskData): Promise<void> => {
    const previousState = tasksByProject
    setError(null)

    setTasksByProject((prev) => {
      const newState = { ...prev }
      for (const projectId in newState) {
        newState[projectId] = newState[projectId].map((task) =>
          task.id === taskId
            ? { ...task, columnId: data.columnId, position: data.position }
            : task
        )
      }
      return newState
    })

    try {
      await tasksService.moveTask(taskId, data)
    } catch (err) {
      setTasksByProject(previousState)
      const errorMessage = err instanceof ApiError ? err.message : "Failed to move task"
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      throw err
    }
  }

  const completeTask = async (taskId: string): Promise<void> => {
    const previousState = tasksByProject
    setError(null)

    setTasksByProject((prev) => {
      const newState = { ...prev }
      const now = new Date().toISOString()
      for (const projectId in newState) {
        newState[projectId] = newState[projectId].map((task) =>
          task.id === taskId ? { ...task, completedAt: now } : task
        )
      }
      return newState
    })

    try {
      await tasksService.completeTask(taskId)
    } catch (err) {
      setTasksByProject(previousState)
      const errorMessage = err instanceof ApiError ? err.message : "Failed to complete task"
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      throw err
    }
  }

  const uncompleteTask = async (taskId: string): Promise<void> => {
    const previousState = tasksByProject
    setError(null)

    setTasksByProject((prev) => {
      const newState = { ...prev }
      for (const projectId in newState) {
        newState[projectId] = newState[projectId].map((task) =>
          task.id === taskId ? { ...task, completedAt: null } : task
        )
      }
      return newState
    })

    try {
      await tasksService.uncompleteTask(taskId)
    } catch (err) {
      setTasksByProject(previousState)
      const errorMessage = err instanceof ApiError ? err.message : "Failed to uncomplete task"
      setError(errorMessage)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      throw err
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <TasksContext.Provider
      value={{
        tasksByProject,
        isLoading,
        error,
        getTasks,
        loadProjectTasks,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        completeTask,
        uncompleteTask,
        clearError,
      }}
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

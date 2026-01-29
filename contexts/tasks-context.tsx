"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { tasksService, CreateTaskData, UpdateTaskData, MoveTaskData } from "@/services/tasks.service"
import { websocketService } from "@/services/websocket.service"
import type { Task } from "@/lib/types"
import { ApiError } from "@/lib/api-client"

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
      
      // Optimistic update (will be confirmed by WebSocket event)
      setTasksByProject((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newTask],
      }))
      
      return newTask
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to create task'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateTask = async (taskId: string, updates: UpdateTaskData): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedTask = await tasksService.updateTask(taskId, updates)
      
      // Optimistic update
      setTasksByProject((prev) => {
        const newState = { ...prev }
        for (const projectId in newState) {
          newState[projectId] = newState[projectId].map((task) =>
            task.id === taskId ? { ...task, ...updatedTask } : task
          )
        }
        return newState
      })
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to update task'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTask = async (taskId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await tasksService.deleteTask(taskId)
      
      // Optimistic update
      setTasksByProject((prev) => {
        const newState = { ...prev }
        for (const projectId in newState) {
          newState[projectId] = newState[projectId].filter(
            (task) => task.id !== taskId
          )
        }
        return newState
      })
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to delete task'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const moveTask = async (taskId: string, data: MoveTaskData): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await tasksService.moveTask(taskId, data)
      
      // Optimistic update
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
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to move task'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const completeTask = async (taskId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedTask = await tasksService.completeTask(taskId)
      
      // Optimistic update
      setTasksByProject((prev) => {
        const newState = { ...prev }
        for (const projectId in newState) {
          newState[projectId] = newState[projectId].map((task) =>
            task.id === taskId ? { ...task, ...updatedTask } : task
          )
        }
        return newState
      })
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to complete task'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const uncompleteTask = async (taskId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedTask = await tasksService.uncompleteTask(taskId)
      
      // Optimistic update
      setTasksByProject((prev) => {
        const newState = { ...prev }
        for (const projectId in newState) {
          newState[projectId] = newState[projectId].map((task) =>
            task.id === taskId ? { ...task, ...updatedTask } : task
          )
        }
        return newState
      })
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to uncomplete task'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
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

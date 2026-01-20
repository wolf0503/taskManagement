"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Column } from "@/lib/types"

// Default columns for initial projects
const defaultColumnsByProject: Record<string, Column[]> = {
  "1": [
    {
      id: "todo",
      title: "To Do",
      color: "var(--status-todo)",
    },
    {
      id: "in-progress",
      title: "In Progress",
      color: "var(--status-progress)",
    },
    {
      id: "review",
      title: "In Review",
      color: "var(--status-review)",
    },
    {
      id: "done",
      title: "Done",
      color: "var(--status-done)",
    },
  ],
}

interface ColumnsContextType {
  getColumns: (projectId: string) => Column[]
  addColumn: (projectId: string, column: Omit<Column, "id">) => void
  updateColumn: (projectId: string, columnId: string, updates: Partial<Column>) => void
  deleteColumn: (projectId: string, columnId: string) => void
  reorderColumns: (projectId: string, columnIds: string[]) => void
}

const ColumnsContext = createContext<ColumnsContextType | undefined>(undefined)

const STORAGE_KEY = "taskManagement_columns"

export function ColumnsProvider({ children }: { children: ReactNode }) {
  const [columnsByProject, setColumnsByProject] = useState<Record<string, Column[]>>({})

  // Load columns from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setColumnsByProject(parsed)
        } catch (error) {
          console.error("Failed to parse stored columns:", error)
          setColumnsByProject(defaultColumnsByProject)
        }
      } else {
        setColumnsByProject(defaultColumnsByProject)
      }
    }
  }, [])

  // Save columns to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(columnsByProject).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnsByProject))
    }
  }, [columnsByProject])

  const getColumns = (projectId: string): Column[] => {
    // If no columns exist for this project, return default columns
    // These are read-only defaults - actual columns will be saved when first added
    if (!columnsByProject[projectId] || columnsByProject[projectId].length === 0) {
      return defaultColumnsByProject["1"] || []
    }
    return columnsByProject[projectId]
  }

  const addColumn = (projectId: string, columnData: Omit<Column, "id">) => {
    const newColumn: Column = {
      ...columnData,
      id: `${projectId}-column-${Date.now()}`, // Unique ID based on project and timestamp
    }
    setColumnsByProject((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newColumn],
    }))
  }

  const updateColumn = (projectId: string, columnId: string, updates: Partial<Column>) => {
    setColumnsByProject((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map((column) =>
        column.id === columnId ? { ...column, ...updates } : column
      ),
    }))
  }

  const deleteColumn = (projectId: string, columnId: string) => {
    setColumnsByProject((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter((column) => column.id !== columnId),
    }))
  }

  const reorderColumns = (projectId: string, columnIds: string[]) => {
    setColumnsByProject((prev) => {
      const columns = prev[projectId] || []
      const reordered = columnIds
        .map((id) => columns.find((col) => col.id === id))
        .filter((col): col is Column => col !== undefined)
      return {
        ...prev,
        [projectId]: reordered,
      }
    })
  }

  return (
    <ColumnsContext.Provider
      value={{ getColumns, addColumn, updateColumn, deleteColumn, reorderColumns }}
    >
      {children}
    </ColumnsContext.Provider>
  )
}

export function useColumns() {
  const context = useContext(ColumnsContext)
  if (context === undefined) {
    throw new Error("useColumns must be used within a ColumnsProvider")
  }
  return context
}

"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import type { Column } from "@/lib/types"
import { columnsService, CreateColumnDTO, UpdateColumnDTO } from "@/services/columns.service"
import { ApiError } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"

interface ColumnsContextType {
  columnsByProject: Record<string, Column[]>
  isLoading: boolean
  error: string | null
  getColumns: (projectId: string) => Column[]
  fetchColumns: (projectId: string, simple?: boolean) => Promise<void>
  addColumn: (projectId: string, column: CreateColumnDTO) => Promise<Column | null>
  updateColumn: (projectId: string, columnId: string, updates: UpdateColumnDTO) => Promise<void>
  deleteColumn: (projectId: string, columnId: string) => Promise<void>
  reorderColumns: (projectId: string, columnIds: string[]) => Promise<void>
  clearError: () => void
}

const ColumnsContext = createContext<ColumnsContextType | undefined>(undefined)

// Default columns to create for new projects
const DEFAULT_COLUMNS = [
  { title: "To Do", color: "#6366f1", position: 0 },
  { title: "In Progress", color: "#f59e0b", position: 1 },
  { title: "In Review", color: "#8b5cf6", position: 2 },
  { title: "Done", color: "#10b981", position: 3 },
]

export function ColumnsProvider({ children }: { children: ReactNode }) {
  const [columnsByProject, setColumnsByProject] = useState<Record<string, Column[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchColumns = useCallback(async (projectId: string, simple: boolean = true) => {
    setIsLoading(true)
    setError(null)

    try {
      const columns = await columnsService.getProjectColumns(projectId, simple)
      
      // ✅ If project has no columns, create default ones
      if (columns.length === 0) {
        console.log('📋 No columns found for project, creating default columns...')
        
        // Create default columns
        try {
          for (const columnData of DEFAULT_COLUMNS) {
            await columnsService.createColumn(projectId, columnData)
          }
          console.log('✅ Default columns created successfully')
        } catch (createErr) {
          console.error('❌ Failed to create default columns:', createErr)
        }
        
        // Fetch again after creating defaults
        const newColumns = await columnsService.getProjectColumns(projectId, simple)
        setColumnsByProject((prev) => ({
          ...prev,
          [projectId]: newColumns,
        }))
        console.log(`✅ Fetched ${newColumns.length} default columns`)
      } else {
        setColumnsByProject((prev) => ({
          ...prev,
          [projectId]: columns,
        }))
        console.log(`✅ Fetched ${columns.length} columns for project ${projectId}:`, columns)
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to fetch columns'
      setError(errorMessage)
      console.error('❌ Failed to fetch columns:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getColumns = (projectId: string): Column[] => {
    return columnsByProject[projectId] || []
  }

  const addColumn = useCallback(async (projectId: string, columnData: CreateColumnDTO): Promise<Column | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const newColumn = await columnsService.createColumn(projectId, columnData)
      setColumnsByProject((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newColumn].sort((a, b) => (a.position || 0) - (b.position || 0)),
      }))
      
      toast({
        title: "Column created",
        description: `${newColumn.title} has been added successfully.`,
      })
      
      return newColumn
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to create column'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateColumn = useCallback(async (projectId: string, columnId: string, updates: UpdateColumnDTO): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedColumn = await columnsService.updateColumn(projectId, columnId, updates)
      setColumnsByProject((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map((col) =>
          col.id === columnId ? updatedColumn : col
        ),
      }))
      
      toast({
        title: "Column updated",
        description: "Column has been updated successfully.",
      })
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to update column'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteColumn = useCallback(async (projectId: string, columnId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await columnsService.deleteColumn(projectId, columnId)
      setColumnsByProject((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] || []).filter((col) => col.id !== columnId),
      }))
      
      toast({
        title: "Column deleted",
        description: "Column has been deleted successfully.",
      })
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to delete column'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reorderColumns = useCallback(async (projectId: string, columnIds: string[]): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Optimistically update UI
      const reordered = columnIds.map((id, index) => {
        const col = columnsByProject[projectId]?.find((c) => c.id === id)!
        return { ...col, position: index }
      })
      setColumnsByProject((prev) => ({
        ...prev,
        [projectId]: reordered,
      }))

      // Update backend
      await columnsService.reorderColumns(projectId, columnIds)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to reorder columns'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      // Revert on error - fetch fresh data
      fetchColumns(projectId)
    } finally {
      setIsLoading(false)
    }
  }, [columnsByProject, fetchColumns])

  const clearError = () => {
    setError(null)
  }

  return (
    <ColumnsContext.Provider
      value={{
        columnsByProject,
        isLoading,
        error,
        getColumns,
        fetchColumns,
        addColumn,
        updateColumn,
        deleteColumn,
        reorderColumns,
        clearError,
      }}
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

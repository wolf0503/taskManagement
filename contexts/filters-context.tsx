"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface TaskFilters {
  assignees: string[] // Array of assignee names
  priority: "HIGH" | "MEDIUM" | "LOW" | null
  showAll: boolean
}

interface FiltersContextType {
  filters: Record<string, TaskFilters> // Keyed by projectId
  setFilters: (projectId: string, filters: TaskFilters) => void
  clearFilters: (projectId: string) => void
  getFilters: (projectId: string) => TaskFilters
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined)

const defaultFilters: TaskFilters = {
  assignees: [],
  priority: null,
  showAll: true,
}

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<Record<string, TaskFilters>>({})

  const setFilters = (projectId: string, newFilters: TaskFilters) => {
    setFiltersState((prev) => ({
      ...prev,
      [projectId]: newFilters,
    }))
  }

  const clearFilters = (projectId: string) => {
    setFiltersState((prev) => ({
      ...prev,
      [projectId]: defaultFilters,
    }))
  }

  const getFilters = (projectId: string): TaskFilters => {
    return filters[projectId] || defaultFilters
  }

  return (
    <FiltersContext.Provider
      value={{ filters, setFilters, clearFilters, getFilters }}
    >
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FiltersContext)
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider")
  }
  return context
}

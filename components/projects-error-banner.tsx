"use client"

import { useProjects } from "@/contexts/projects-context"
import { Button } from "@/components/ui/button"

export function ProjectsErrorBanner() {
  const { error, isLoading, refreshProjects, clearError } = useProjects()
  if (!error || isLoading) return null
  return (
    <div className="sticky top-0 z-50 px-4 py-3 border-b border-amber-500/50 bg-amber-500/10 flex flex-wrap items-center justify-center gap-3 text-center">
      <p className="text-sm text-foreground">{error}</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => { clearError(); refreshProjects(); }}>
          Retry
        </Button>
        <Button variant="ghost" size="sm" onClick={clearError}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}

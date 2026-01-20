"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Grid3X3, List, Clock, CheckCircle2, Pause, FileText, X } from "lucide-react"
import type { Project } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { useFilters } from "@/contexts/filters-context"

const statusConfig = {
  "in-progress": {
    label: "In Progress",
    icon: Clock,
    className: "bg-accent/20 text-accent",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-status-done/20 text-status-done",
  },
  "on-hold": {
    label: "On Hold",
    icon: Pause,
    className: "bg-muted/50 text-muted-foreground",
  },
  planning: {
    label: "Planning",
    icon: FileText,
    className: "bg-status-todo/20 text-status-todo",
  },
}

interface HeaderProps {
  project?: Project
  projectId?: string
}

export function Header({ project, projectId }: HeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { getFilters, setFilters, clearFilters } = useFilters()
  const filters = projectId ? getFilters(projectId) : { assignees: [], priority: null, showAll: true }
  
  const projectName = project?.name || "Website Redesign"
  const projectDescription = project?.description || "Redesigning the main website with modern UI/UX principles"
  const projectStatus = project?.status || "in-progress"
  const teamMembers = project?.teamMembers || [
    { name: "Alice", avatar: "/professional-woman.png" },
    { name: "Bob", avatar: "/professional-man.png" },
    { name: "Carol", avatar: "/woman-developer.png" },
    { name: "David", avatar: "/man-designer.png" },
  ]

  const statusInfo = statusConfig[projectStatus]
  const StatusIcon = statusInfo.icon

  const handleAssigneeToggle = (assigneeName: string) => {
    if (!projectId) return
    
    const currentAssignees = filters.assignees || []
    const newAssignees = currentAssignees.includes(assigneeName)
      ? currentAssignees.filter((name) => name !== assigneeName)
      : [...currentAssignees, assigneeName]
    
    setFilters(projectId, {
      ...filters,
      assignees: newAssignees,
      showAll: newAssignees.length === 0,
    })
  }

  const handleClearFilters = () => {
    if (!projectId) return
    clearFilters(projectId)
  }

  const hasActiveFilters = (filters.assignees && filters.assignees.length > 0) || filters.priority !== null
  const isFiltered = (memberName: string) => filters.assignees?.includes(memberName) || false

  return (
    <header className="sticky top-0 z-30 px-4 lg:px-8 py-4">
      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-balance">{projectName}</h1>
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1", statusInfo.className)}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{projectDescription}</p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Team avatars - clickable for filtering */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 4).map((member, i) => {
                const filtered = isFiltered(member.name)
                return (
                  <button
                    key={member.name}
                    onClick={() => handleAssigneeToggle(member.name)}
                    className={cn(
                      "relative transition-all duration-200 hover:scale-110 hover:z-10 cursor-pointer",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-full"
                    )}
                    title={`${filtered ? "Remove filter" : "Filter by"} ${member.name}`}
                  >
                    <Avatar
                      className={cn(
                        "h-8 w-8 ring-2 transition-all",
                        filtered
                          ? "ring-primary ring-4 shadow-lg shadow-primary/50"
                          : "ring-background hover:ring-primary/50"
                      )}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {filtered && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                        <X className="h-2.5 w-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                )
              })}
              {teamMembers.length > 4 && (
                <button
                  className="h-8 w-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground hover:bg-secondary/80 transition-colors"
                  title={`${teamMembers.length - 4} more team members`}
                >
                  +{teamMembers.length - 4}
                </button>
              )}
            </div>
            {/* Clear filters button - only show when filters are active */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="ml-2 h-7 px-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex items-center gap-1"
                title="Clear all filters"
              >
                <X className="h-3 w-3" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* View toggles */}
          <div className="hidden sm:flex items-center gap-1 glass-subtle rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-primary/20 text-primary">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Task */}
          <Button
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </div>

      {/* Add Task Dialog */}
      {projectId && (
        <AddTaskDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          projectId={projectId}
        />
      )}
    </header>
  )
}

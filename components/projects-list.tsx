"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, FolderKanban, Users, CheckCircle2, Clock, Pause, FileText, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useProjects } from "@/contexts/projects-context"
import { useTasks } from "@/contexts/tasks-context"
import { useColumns } from "@/contexts/columns-context"
import { AddProjectDialog } from "@/components/add-project-dialog"

const statusConfig = {
  "IN_PROGRESS": {
    label: "In Progress",
    icon: Clock,
    className: "bg-accent/20 text-accent",
  },
  "COMPLETED": {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-status-done/20 text-status-done",
  },
  "ON_HOLD": {
    label: "On Hold",
    icon: Pause,
    className: "bg-muted/50 text-muted-foreground",
  },
  "PLANNING": {
    label: "Planning",
    icon: FileText,
    className: "bg-status-todo/20 text-status-todo",
  },
}

export function ProjectsList() {
  const router = useRouter()
  const { projects } = useProjects()
  const { getTasks } = useTasks()
  const { getColumns } = useColumns()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Calculate project stats dynamically from tasks
  const projectsWithStats = useMemo(() => {
    return projects.map((project) => {
      const tasks = getTasks(project.id)
      const columns = getColumns(project.id)
      
      // Find the "done" column ID (could be "done" or any column with "done" in the title)
      const doneColumnId = columns.find((col) => 
        col.id === "done" || col.title.toLowerCase().includes("done")
      )?.id

      const taskCount = tasks.length
      const completedTasks = doneColumnId
        ? tasks.filter((task) => task.columnId === doneColumnId).length
        : 0

      return {
        ...project,
        taskCount,
        completedTasks,
      }
    })
  }, [projects, getTasks, getColumns])

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleCreateProject = () => {
    setIsDialogOpen(true)
  }

  return (
    <div className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage and organize your projects</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Buttons */}
            <div className="flex items-center gap-1 p-1 glass-subtle rounded-lg border border-glass-border mr-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", viewMode === "grid" && "bg-primary/20 text-primary")}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", viewMode === "list" && "bg-primary/20 text-primary")}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleCreateProject}
              className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid or List */}
      <div className={cn(
        viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      )}>
        {projectsWithStats.map((project) => {
          const statusInfo = statusConfig[project.status]
          const StatusIcon = statusInfo.icon
          const progress = project.taskCount > 0
            ? Math.round((project.completedTasks || 0) / project.taskCount * 100)
            : 0

          return viewMode === "grid" ? (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="glass rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl card-hover group"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", project.color)}>
                    <FolderKanban className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-3 w-3" />
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusInfo.className)}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Progress */}
              {project.taskCount > 0 ? (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>{project.completedTasks || 0} of {project.taskCount} tasks completed</span>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: "0%" }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>0 tasks</span>
                  </div>
                </div>
              )}

              {/* Team Members */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {(project.teamMembers || []).slice(0, 3).map((member, i) => (
                      <Avatar
                        key={member.name}
                        className="h-7 w-7 ring-2 ring-background"
                      >
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {member.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {(project.teamMembers?.length || 0) > 3 && (
                      <div className="h-7 w-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                        +{(project.teamMembers?.length || 0) - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {project.teamMembers?.length || 0} {(project.teamMembers?.length || 0) === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // List View
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="glass rounded-xl p-4 cursor-pointer transition-all hover:border-primary/50 group"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", project.color)}>
                  <FolderKanban className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusConfig[project.status].className)}>
                      {statusConfig[project.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm font-medium">{project.taskCount}</div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{progress}%</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                  <div className="flex -space-x-2">
                    {(project.teamMembers || []).slice(0, 3).map((member) => (
                      <Avatar
                        key={member.name}
                        className="h-7 w-7 ring-2 ring-background"
                      >
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {member.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {(project.teamMembers?.length || 0) > 3 && (
                      <div className="h-7 w-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                        +{(project.teamMembers?.length || 0) - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State (if no projects) */}
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get started by creating your first project to organize your tasks and collaborate with your team.
          </p>
          <Button
            onClick={handleCreateProject}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
      )}

      {/* Add Project Dialog */}
      <AddProjectDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}

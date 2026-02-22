"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, FolderKanban, Users, CheckCircle2, Clock, Pause, FileText, LayoutGrid, List, MoreVertical, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useProjects } from "@/contexts/projects-context"
import { useTasks } from "@/contexts/tasks-context"
import { useColumns } from "@/contexts/columns-context"
import { projectsService } from "@/services/projects.service"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

// Fallback palette when project.color is missing or invalid (hex only)
const PROJECT_COLOR_PALETTE = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#EF4444"]

function getProjectColorStyles(project: { color?: string }, index: number) {
  const raw = project.color?.trim()
  const isHex = raw?.startsWith("#")
  const fallbackHex = PROJECT_COLOR_PALETTE[index % PROJECT_COLOR_PALETTE.length]
  const accentHex = isHex ? raw! : fallbackHex

  let iconClassName: string | undefined
  let iconStyle: { backgroundColor: string } | undefined
  if (isHex) {
    iconStyle = { backgroundColor: raw }
  } else if (raw && raw.startsWith("bg-")) {
    iconClassName = raw
  } else {
    iconStyle = { backgroundColor: fallbackHex }
  }

  return {
    iconClassName,
    iconStyle,
    accentHex,
    progressStyle: { backgroundColor: accentHex },
  }
}

export function ProjectsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { projects } = useProjects()
  const { getTasks } = useTasks()
  const { getColumns } = useColumns()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<typeof projectsWithStats[0] | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({})

  // Open New Project dialog when navigating from Dashboard with ?new=1
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setIsDialogOpen(true)
      router.replace("/projects", { scroll: false })
    }
  }, [searchParams, router])

  // Fetch project member count for each project
  useEffect(() => {
    if (projects.length === 0) {
      setMemberCounts({})
      return
    }
    let cancelled = false
    const loadCounts = async () => {
      const counts: Record<string, number> = {}
      await Promise.all(
        projects.map(async (project) => {
          try {
            const members = await projectsService.getProjectMembers(project.id)
            if (!cancelled) counts[project.id] = members.length
          } catch {
            if (!cancelled) counts[project.id] = 0
          }
        })
      )
      if (!cancelled) setMemberCounts((prev) => ({ ...prev, ...counts }))
    }
    loadCounts()
    return () => {
      cancelled = true
    }
  }, [projects])

  // Calculate project stats dynamically from tasks + member count
  const projectsWithStats = useMemo(() => {
    return projects.map((project) => {
      const tasks = getTasks(project.id)
      const columns = getColumns(project.id)
      
      const doneColumnId = columns.find((col) => 
        col.id === "done" || col.title.toLowerCase().includes("done")
      )?.id

      const taskCount = tasks.length
      const completedTasks = doneColumnId
        ? tasks.filter((task) => task.columnId === doneColumnId).length
        : 0
      const memberCount = memberCounts[project.id] ?? project.teamMembers?.length ?? 0

      return {
        ...project,
        taskCount,
        completedTasks,
        memberCount,
      }
    })
  }, [projects, getTasks, getColumns, memberCounts])

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
        {projectsWithStats.map((project, index) => {
          const statusInfo = statusConfig[project.status]
          const StatusIcon = statusInfo.icon
          const progress = project.taskCount > 0
            ? Math.round((project.completedTasks || 0) / project.taskCount * 100)
            : 0
          const colorStyles = getProjectColorStyles(project, index)

          return viewMode === "grid" ? (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="glass rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl card-hover group border-l-4"
              style={{
                borderLeftColor: colorStyles.accentHex,
                backgroundColor: `${colorStyles.accentHex}0D`,
              }}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorStyles.iconClassName)}
                    style={colorStyles.iconStyle}
                  >
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass border-glass-border">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      className="h-full rounded-full transition-all"
                      style={{ width: `${progress}%`, ...colorStyles.progressStyle }}
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
                      className="h-full rounded-full transition-all"
                      style={{ width: "0%", ...colorStyles.progressStyle }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>0 tasks</span>
                  </div>
                </div>
              )}

              {/* Project members count */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {(project.teamMembers || []).slice(0, 3).map((member, i) => (
                      <Tooltip key={(member as { id?: string }).id ?? `member-${i}`}>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Avatar className="h-7 w-7 ring-2 ring-background">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                {member.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>{member.name}</TooltipContent>
                      </Tooltip>
                    ))}
                    {(project.teamMembers?.length || 0) > 3 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <div className="h-7 w-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                              +{(project.teamMembers?.length || 0) - 3}
                            </div>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {(project.teamMembers?.length || 0) - 3} more members
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground ml-2 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {project.memberCount ?? 0} {(project.memberCount ?? 0) === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // List View
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="glass rounded-xl p-4 cursor-pointer transition-all hover:border-primary/50 group border-l-4"
              style={{
                borderLeftColor: colorStyles.accentHex,
                backgroundColor: `${colorStyles.accentHex}0D`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", colorStyles.iconClassName)}
                  style={colorStyles.iconStyle}
                >
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass border-glass-border">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="text-center">
                    <div className="text-sm font-medium">{project.taskCount}</div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{progress}%</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                  <div className="flex items-center gap-2 text-center">
                    <div className="flex -space-x-2">
                      {(project.teamMembers || []).slice(0, 3).map((member, i) => (
                        <Tooltip key={(member as { id?: string }).id ?? `member-${i}`}>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <Avatar className="h-7 w-7 ring-2 ring-background">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                  {member.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>{member.name}</TooltipContent>
                        </Tooltip>
                      ))}
                      {(project.teamMembers?.length || 0) > 3 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <div className="h-7 w-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                                +{(project.teamMembers?.length || 0) - 3}
                              </div>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            {(project.teamMembers?.length || 0) - 3} more members
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {project.memberCount ?? 0} {(project.memberCount ?? 0) === 1 ? "member" : "members"}
                    </span>
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
      {/* Edit Project Dialog */}
      <EditProjectDialog
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
        project={editingProject}
      />
    </div>
  )
}

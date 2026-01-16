"use client"

import { useRouter } from "next/navigation"
import { Plus, FolderKanban, Users, CheckCircle2, Clock, Pause, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Project } from "@/lib/types"
import { cn } from "@/lib/utils"

const projects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Redesigning the main website with modern UI/UX principles",
    status: "in-progress",
    color: "bg-chart-1",
    teamMembers: [
      { name: "Alice", avatar: "/professional-woman.png" },
      { name: "Bob", avatar: "/professional-man.png" },
      { name: "Carol", avatar: "/woman-developer.png" },
      { name: "David", avatar: "/man-designer.png" },
    ],
    taskCount: 8,
    completedTasks: 2,
  },
  {
    id: "2",
    name: "Mobile App",
    description: "Building a cross-platform mobile application",
    status: "in-progress",
    color: "bg-chart-2",
    teamMembers: [
      { name: "Alice", avatar: "/professional-woman.png" },
      { name: "Bob", avatar: "/professional-man.png" },
    ],
    taskCount: 12,
    completedTasks: 5,
  },
  {
    id: "3",
    name: "Marketing Campaign",
    description: "Q1 marketing campaign planning and execution",
    status: "planning",
    color: "bg-chart-3",
    teamMembers: [
      { name: "Carol", avatar: "/woman-developer.png" },
    ],
    taskCount: 6,
    completedTasks: 0,
  },
  {
    id: "4",
    name: "API Development",
    description: "RESTful API development and documentation",
    status: "completed",
    color: "bg-chart-4",
    teamMembers: [
      { name: "David", avatar: "/man-designer.png" },
      { name: "Alice", avatar: "/professional-woman.png" },
    ],
    taskCount: 15,
    completedTasks: 15,
  },
  {
    id: "5",
    name: "Database Migration",
    description: "Migrating to a new database system",
    status: "on-hold",
    color: "bg-chart-5",
    teamMembers: [
      { name: "Bob", avatar: "/professional-man.png" },
      { name: "Carol", avatar: "/woman-developer.png" },
    ],
    taskCount: 10,
    completedTasks: 3,
  },
]

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

export function ProjectsList() {
  const router = useRouter()

  const handleProjectClick = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`)
  }

  const handleCreateProject = () => {
    // TODO: Implement create project modal/dialog
    console.log("Create new project")
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
          <Button
            onClick={handleCreateProject}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const statusInfo = statusConfig[project.status]
          const StatusIcon = statusInfo.icon
          const progress = project.taskCount
            ? Math.round((project.completedTasks || 0) / project.taskCount * 100)
            : 0

          return (
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
              {project.taskCount && project.taskCount > 0 && (
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
              )}

              {/* Team Members */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 3).map((member, i) => (
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
                    {project.teamMembers.length > 3 && (
                      <div className="h-7 w-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                        +{project.teamMembers.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {project.teamMembers.length} {project.teamMembers.length === 1 ? "member" : "members"}
                  </span>
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
    </div>
  )
}

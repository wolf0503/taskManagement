"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Filter, Grid3X3, List, ChevronDown, Clock, CheckCircle2, Pause, FileText } from "lucide-react"
import type { Project } from "@/lib/types"
import { cn } from "@/lib/utils"

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
}

export function Header({ project }: HeaderProps) {
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
          {/* Team avatars */}
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 4).map((member, i) => (
              <Avatar
                key={member.name}
                className="h-8 w-8 ring-2 ring-background transition-transform hover:scale-110 hover:z-10"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">{member.name[0]}</AvatarFallback>
              </Avatar>
            ))}
            {teamMembers.length > 4 && (
              <button className="h-8 w-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground hover:bg-secondary/80 transition-colors">
                +{teamMembers.length - 4}
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

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="glass-subtle gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass border-glass-border">
              <DropdownMenuItem>All Tasks</DropdownMenuItem>
              <DropdownMenuItem>My Tasks</DropdownMenuItem>
              <DropdownMenuItem>High Priority</DropdownMenuItem>
              <DropdownMenuItem>Due This Week</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Task */}
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageSquare, Paperclip, Calendar, MoreHorizontal, Flag, Trash2, Edit } from "lucide-react"
import type { Task } from "@/lib/types"

interface TaskCardProps {
  task: Task
  onDragStart: (taskId: string, columnId: string) => void
  onDragEnd: () => void
  index: number
}

const priorityConfig = {
  high: { color: "bg-destructive/20 text-destructive", icon: "🔴" },
  medium: { color: "bg-chart-4/20 text-chart-4", icon: "🟡" },
  low: { color: "bg-accent/20 text-accent", icon: "🟢" },
}

const tagColors: Record<string, string> = {
  Design: "bg-chart-1/20 text-chart-1",
  Development: "bg-chart-2/20 text-chart-2",
  Documentation: "bg-chart-3/20 text-chart-3",
  Backend: "bg-chart-4/20 text-chart-4",
  API: "bg-chart-5/20 text-chart-5",
  Security: "bg-destructive/20 text-destructive",
  Auth: "bg-primary/20 text-primary",
  Performance: "bg-accent/20 text-accent",
  UI: "bg-chart-1/20 text-chart-1",
  Mobile: "bg-chart-2/20 text-chart-2",
  DevOps: "bg-chart-3/20 text-chart-3",
  Infrastructure: "bg-chart-4/20 text-chart-4",
  Branding: "bg-chart-5/20 text-chart-5",
}

export function TaskCard({ task, onDragStart, onDragEnd, index }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = "move"
    onDragStart(task.id, task.columnId)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd()
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "glass rounded-xl p-4 cursor-grab active:cursor-grabbing card-hover group",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        isDragging && "opacity-50 scale-95 rotate-2",
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priorityConfig[task.priority].color)}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                tagColors[tag] || "bg-secondary text-secondary-foreground",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass border-glass-border" align="end">
            <DropdownMenuItem className="gap-2">
              <Edit className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Flag className="h-4 w-4" /> Set Priority
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title & Description */}
      <h4 className="font-semibold text-foreground mb-1 line-clamp-2">{task.title}</h4>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{task.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-muted-foreground">
          {task.comments > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{task.comments}</span>
            </div>
          )}
          {task.attachments > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Paperclip className="h-3.5 w-3.5" />
              <span>{task.attachments}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            <span>{task.dueDate}</span>
          </div>
        </div>
        <Avatar className="h-7 w-7 ring-2 ring-background">
          <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs">{task.assignee.name[0]}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, MoreHorizontal, Flag, Trash2, Edit } from "lucide-react"
import type { Task } from "@/lib/types"
import { useTasks } from "@/contexts/tasks-context"
import { toast } from "@/hooks/use-toast"
import { ApiError } from "@/lib/api-client"

interface TaskCardProps {
  task: Task
  onDragStart: (taskId: string, columnId: string) => void
  onDragEnd: () => void
  index: number
  projectId?: string
  /** When provided, clicking assignee avatar filters tasks by that assignee */
  onFilterByAssignee?: (assigneeDisplayName: string) => void
}

const priorityConfig = {
  HIGH: { color: "bg-destructive/20 text-destructive", icon: "🔴" },
  MEDIUM: { color: "bg-chart-4/20 text-chart-4", icon: "🟡" },
  LOW: { color: "bg-accent/20 text-accent", icon: "🟢" },
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

function getAssigneeDisplayName(assignee: { firstName?: string; lastName?: string; email?: string }): string {
  const full = [assignee.firstName, assignee.lastName].filter(Boolean).join(" ")
  return full || assignee.email || ""
}

export function TaskCard({ task, onDragStart, onDragEnd, index, onFilterByAssignee }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteTask } = useTasks()

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await deleteTask(task.id)
      toast({ title: "Task deleted", description: "The task has been removed." })
      setDeleteDialogOpen(false)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete task"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id)
    e.dataTransfer.setData("application/json", JSON.stringify({ taskId: task.id, columnId: task.columnId }))
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
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}
          </span>
          {task.tags && Array.isArray(task.tags) && task.tags.slice(0, 2).map((tag) => (
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
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete task?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove &quot;{task.title}&quot;. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteConfirm()
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Title & Description */}
      <h4 className="font-semibold text-foreground mb-1 line-clamp-2">{task.title}</h4>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{task.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {task.estimatedHours && (
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>
        {task.assignee && (
          <Tooltip>
            <TooltipTrigger asChild>
              {onFilterByAssignee ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFilterByAssignee(getAssigneeDisplayName(task.assignee!))
                  }}
                  className="inline-flex rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <Avatar className="h-7 w-7 ring-2 ring-background cursor-pointer hover:ring-primary/50 transition-all">
                    <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={getAssigneeDisplayName(task.assignee)} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getAssigneeDisplayName(task.assignee)[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              ) : (
                <span className="inline-flex">
                  <Avatar className="h-7 w-7 ring-2 ring-background">
                    <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={getAssigneeDisplayName(task.assignee)} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getAssigneeDisplayName(task.assignee)[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                </span>
              )}
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              {getAssigneeDisplayName(task.assignee)}
              {onFilterByAssignee && <span className="block text-[10px] opacity-90">Click to filter by this assignee</span>}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

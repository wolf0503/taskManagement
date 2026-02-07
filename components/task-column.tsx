"use client"

import { useState } from "react"
import type React from "react"

import { cn } from "@/lib/utils"
import { TaskCard } from "@/components/task-card"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, GripVertical } from "lucide-react"
import type { Task, Column } from "@/lib/types"
import { AddTaskDialog } from "@/components/add-task-dialog"

interface TaskColumnProps {
  column: Column
  tasks: Task[]
  onDragStart: (taskId: string, columnId: string) => void
  onDragEnd: () => void
  onDrop: (columnId: string) => void
  draggedTask: { id: string; columnId: string } | null
  index: number
  projectId: string
  /** When provided, assignee avatar on task card can be clicked to filter by that assignee */
  onFilterByAssignee?: (assigneeDisplayName: string) => void
  /** Column reorder: drag by header */
  onColumnDragStart?: (e: React.DragEvent) => void
  onColumnDragEnd?: () => void
  isColumnDragging?: boolean
}

export function TaskColumn({
  column,
  tasks,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedTask,
  index,
  projectId,
  onFilterByAssignee,
  onColumnDragStart,
  onColumnDragEnd,
  isColumnDragging,
}: TaskColumnProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const isToDoColumn =
    column.title.trim().toLowerCase() === "to do" ||
    column.title.trim().toLowerCase() === "todo"

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDrop(column.id)
  }

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Column Header - grip handle for reorder */}
      <div
        className={cn(
          "flex items-center justify-between mb-4 px-1 rounded-lg gap-1",
          isColumnDragging && "opacity-70"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onColumnDragStart && (
            <span
              draggable
              onDragStart={onColumnDragStart}
              onDragEnd={onColumnDragEnd}
              className="cursor-grab active:cursor-grabbing p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 touch-none"
              title="Drag to reorder column"
            >
              <GripVertical className="h-4 w-4" />
            </span>
          )}
          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
          <h3 className="font-semibold text-foreground truncate">{column.title}</h3>
          <span className="glass-subtle px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground shrink-0">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isToDoColumn && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsDialogOpen(true)}
              title="Add task"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        className={cn(
          "space-y-3 min-h-[200px] p-2 rounded-2xl transition-colors duration-200",
          draggedTask && draggedTask.columnId !== column.id && "bg-primary/5 border-2 border-dashed border-primary/30",
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {tasks.map((task, taskIndex) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            index={taskIndex}
            projectId={projectId}
            onFilterByAssignee={onFilterByAssignee}
          />
        ))}

        {/* Empty state - Add Task button only in To Do column */}
        {tasks.length === 0 && (
          <div className="glass-subtle rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No tasks yet</p>
            {isToDoColumn && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 gap-1"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-3 w-3" />
                Add Task
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Task Dialog - only for To Do column */}
      {isToDoColumn && (
        <AddTaskDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          projectId={projectId}
          defaultColumnId={column.id}
        />
      )}
    </div>
  )
}

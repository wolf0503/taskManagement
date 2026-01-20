"use client"

import { useState } from "react"
import type React from "react"

import { cn } from "@/lib/utils"
import { TaskCard } from "@/components/task-card"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal } from "lucide-react"
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
}: TaskColumnProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop(column.id)
  }

  return (
    <div
      className="w-80 shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="font-semibold text-foreground">{column.title}</h3>
          <span className="glass-subtle px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
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
          <TaskCard key={task.id} task={task} onDragStart={onDragStart} onDragEnd={onDragEnd} index={taskIndex} />
        ))}

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="glass-subtle rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No tasks yet</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 gap-1"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Add Task
            </Button>
          </div>
        )}
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
        defaultColumnId={column.id}
      />
    </div>
  )
}

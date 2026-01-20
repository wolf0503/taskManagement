"use client"

import { useState, useMemo } from "react"
import { TaskColumn } from "@/components/task-column"
import { useTasks } from "@/contexts/tasks-context"
import { useColumns } from "@/contexts/columns-context"
import { useFilters } from "@/contexts/filters-context"
import { AddColumnDialog } from "@/components/add-column-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"

interface TaskBoardProps {
  projectId: string
}

export function TaskBoard({ projectId }: TaskBoardProps) {
  const { getTasks, moveTask } = useTasks()
  const { getColumns } = useColumns()
  const { getFilters } = useFilters()
  const allTasks = getTasks(projectId)
  const columns = getColumns(projectId)
  const filters = getFilters(projectId)
  const [draggedTask, setDraggedTask] = useState<{ id: string; columnId: string } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...allTasks]

    // Filter by assignees
    if (filters.assignees && filters.assignees.length > 0) {
      filtered = filtered.filter((task) =>
        filters.assignees!.includes(task.assignee.name)
      )
    }

    // Filter by priority
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority)
    }

    return filtered
  }, [allTasks, filters])

  const handleDragStart = (taskId: string, columnId: string) => {
    setDraggedTask({ id: taskId, columnId })
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
  }

  const handleDrop = (columnId: string) => {
    if (draggedTask && draggedTask.columnId !== columnId) {
      moveTask(projectId, draggedTask.id, columnId)
      setDraggedTask(null)
    }
  }

  return (
    <div className="flex-1 p-4 lg:p-8 pt-0 overflow-x-auto">
      <div className="flex gap-6 min-w-max pb-4">
        {columns.map((column, index) => {
          const columnTasks = filteredTasks.filter((task) => task.columnId === column.id)
          return (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              draggedTask={draggedTask}
              index={index}
              projectId={projectId}
            />
          )
        })}

        {/* Add Column Button */}
        <div className="w-80 shrink-0">
          <Button
            variant="outline"
            className={cn(
              "w-full h-auto min-h-[200px] flex flex-col items-center justify-center gap-2",
              "glass-subtle border-dashed border-2 hover:border-primary/50",
              "hover:bg-primary/5 transition-all duration-200"
            )}
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Add Column</span>
          </Button>
        </div>
      </div>

      {/* Add Column Dialog */}
      <AddColumnDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
      />
    </div>
  )
}

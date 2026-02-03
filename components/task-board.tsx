"use client"

import { useState, useMemo } from "react"
import { TaskColumn } from "@/components/task-column"
import { TaskCard } from "@/components/task-card"
import { useTasks } from "@/contexts/tasks-context"
import { useColumns } from "@/contexts/columns-context"
import { useFilters } from "@/contexts/filters-context"
import { AddColumnDialog } from "@/components/add-column-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, LayoutGrid, List } from "lucide-react"
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
  const [viewMode, setViewMode] = useState<"board" | "list">("board")

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "MEDIUM":
        return "bg-accent/20 text-accent border-accent/30"
      case "LOW":
        return "bg-muted/50 text-muted-foreground border-muted"
      default:
        return "bg-muted/50 text-muted-foreground border-muted"
    }
  }

  return (
    <div className="flex-1 p-4 lg:p-8 pt-0">
      {/* View Toggle Buttons */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-1 p-1 glass-subtle rounded-lg border border-glass-border">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", viewMode === "board" && "bg-primary/20 text-primary")}
            onClick={() => setViewMode("board")}
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
      </div>

      {viewMode === "board" ? (
        /* Board View */
        <div className="overflow-x-auto">
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
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const column = columns.find(c => c.id === task.columnId)
              return (
                <div
                  key={task.id}
                  className="glass rounded-xl p-4 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Task Title & Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{task.title}</h3>
                        {task.priority && (
                          <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                      )}
                    </div>

                    {/* Column Status */}
                    <div className="flex-shrink-0">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${column?.color}20`,
                          borderColor: column?.color,
                          color: column?.color 
                        }}
                      >
                        {column?.title || 'Unknown'}
                      </Badge>
                    </div>

                    {/* Assignee */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Avatar className="h-8 w-8 ring-2 ring-background">
                        <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {task.assignee.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground hidden sm:inline">{task.assignee.name}</span>
                    </div>

                    {/* Due Date */}
                    {task.dueDate && (
                      <div className="text-sm text-muted-foreground flex-shrink-0 hidden md:block">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No tasks found
            </div>
          )}
        </div>
      )}

      {/* Add Column Dialog */}
      <AddColumnDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
      />
    </div>
  )
}

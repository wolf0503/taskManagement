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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, User } from "@/lib/types"

/** Same format as header teamMembers name (firstName + lastName or email) for consistent filter matching */
function getAssigneeDisplayName(assignee: User): string {
  const full = [assignee.firstName, assignee.lastName].filter(Boolean).join(" ")
  return full || assignee.email || ""
}

interface TaskBoardProps {
  projectId: string
}

const COLUMN_DRAG_TYPE = "application/x-column-id"

export function TaskBoard({ projectId }: TaskBoardProps) {
  const { getTasks, moveTask } = useTasks()
  const { getColumns, reorderColumns } = useColumns()
  const { getFilters, setFilters } = useFilters()
  const allTasks = getTasks(projectId)
  const columns = getColumns(projectId)
  const filters = getFilters(projectId)
  const [draggedTask, setDraggedTask] = useState<{ id: string; columnId: string } | null>(null)
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"board" | "list">("board")

  /** Set assignee filter when clicking an assignee avatar (board or list) */
  const handleFilterByAssignee = (assigneeDisplayName: string) => {
    setFilters(projectId, {
      ...filters,
      assignees: [assigneeDisplayName],
      showAll: false,
    })
  }

  // Apply filters to tasks (use same display name as header teamMembers for matching)
  const filteredTasks = useMemo(() => {
    let filtered = [...allTasks]

    if (filters.assignees && filters.assignees.length > 0) {
      filtered = filtered.filter((task) => {
        if (!task.assignee) return false
        const name = getAssigneeDisplayName(task.assignee)
        return name && filters.assignees!.includes(name)
      })
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
      moveTask(draggedTask.id, { columnId, position: 0 })
      setDraggedTask(null)
    }
  }

  /** Column reorder: drag by header, drop on column container */
  const handleColumnDragStart = (columnId: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData(COLUMN_DRAG_TYPE, columnId)
    setDraggedColumnId(columnId)
  }

  const handleColumnDragEnd = () => {
    setDraggedColumnId(null)
  }

  const handleColumnDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(COLUMN_DRAG_TYPE)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleColumnDrop = (targetColumnId: string) => (e: React.DragEvent) => {
    e.preventDefault()
    const draggedId = e.dataTransfer.getData(COLUMN_DRAG_TYPE)
    if (!draggedId || draggedId === targetColumnId) {
      setDraggedColumnId(null)
      return
    }
    const currentIds = columns.map((c) => c.id)
    const fromIndex = currentIds.indexOf(draggedId)
    const toIndex = currentIds.indexOf(targetColumnId)
    if (fromIndex === -1 || toIndex === -1) {
      setDraggedColumnId(null)
      return
    }
    const newIds = currentIds.filter((id) => id !== draggedId)
    newIds.splice(toIndex, 0, draggedId)
    reorderColumns(projectId, newIds)
    setDraggedColumnId(null)
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
      {/* Toolbar: View Toggle + Add Column */}
      <div className="flex items-center justify-end gap-2 mb-4">
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
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-dashed"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add column
        </Button>
      </div>

      {viewMode === "board" ? (
        /* Board View */
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-max pb-4">
        {columns.map((column, index) => {
          const columnTasks = filteredTasks.filter((task) => task.columnId === column.id)
          const isColumnDragging = draggedColumnId === column.id
          return (
            <div
              key={column.id}
              className={cn(
                "w-80 shrink-0 transition-opacity duration-200",
                isColumnDragging && "opacity-50"
              )}
              onDragOver={handleColumnDragOver}
              onDrop={handleColumnDrop(column.id)}
            >
              <TaskColumn
                column={column}
                tasks={columnTasks}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                draggedTask={draggedTask}
                index={index}
                projectId={projectId}
                onFilterByAssignee={handleFilterByAssignee}
                onColumnDragStart={handleColumnDragStart(column.id)}
                onColumnDragEnd={handleColumnDragEnd}
                isColumnDragging={isColumnDragging}
              />
            </div>
          )
        })}
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

                    {/* Assignee - click to filter by this assignee */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.assignee ? (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => handleFilterByAssignee(getAssigneeDisplayName(task.assignee!))}
                                className="inline-flex rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                              >
                                <Avatar className="h-8 w-8 ring-2 ring-background cursor-pointer hover:ring-primary/50 transition-all">
                                  <AvatarImage src={task.assignee.avatar} alt={getAssigneeDisplayName(task.assignee)} />
                                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                    {getAssigneeDisplayName(task.assignee)[0]?.toUpperCase() ?? "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={6}>
                              {getAssigneeDisplayName(task.assignee)}
                              <span className="block text-[10px] opacity-90">Click to filter by this assignee</span>
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-sm text-muted-foreground hidden sm:inline">{getAssigneeDisplayName(task.assignee)}</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
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

"use client"

import { useState } from "react"
import { TaskColumn } from "@/components/task-column"
import type { Task, Column } from "@/lib/types"

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "var(--status-todo)",
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "var(--status-progress)",
  },
  {
    id: "review",
    title: "In Review",
    color: "var(--status-review)",
  },
  {
    id: "done",
    title: "Done",
    color: "var(--status-done)",
  },
]

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Design system documentation",
    description: "Create comprehensive docs for the design system components",
    columnId: "todo",
    priority: "high",
    tags: ["Design", "Documentation"],
    assignee: { name: "Alice", avatar: "/professional-woman.png" },
    dueDate: "Jan 20",
    comments: 5,
    attachments: 2,
  },
  {
    id: "2",
    title: "Implement dark mode",
    description: "Add dark mode support across all components",
    columnId: "todo",
    priority: "medium",
    tags: ["Development", "UI"],
    assignee: { name: "Bob", avatar: "/professional-man.png" },
    dueDate: "Jan 22",
    comments: 3,
    attachments: 0,
  },
  {
    id: "3",
    title: "API integration",
    description: "Connect frontend with the new REST API endpoints",
    columnId: "in-progress",
    priority: "high",
    tags: ["Backend", "API"],
    assignee: { name: "Carol", avatar: "/woman-developer.png" },
    dueDate: "Jan 18",
    comments: 8,
    attachments: 4,
  },
  {
    id: "4",
    title: "User authentication flow",
    description: "Implement OAuth and email/password authentication",
    columnId: "in-progress",
    priority: "high",
    tags: ["Security", "Auth"],
    assignee: { name: "David", avatar: "/man-designer.png" },
    dueDate: "Jan 19",
    comments: 12,
    attachments: 1,
  },
  {
    id: "5",
    title: "Performance optimization",
    description: "Optimize bundle size and improve Core Web Vitals",
    columnId: "review",
    priority: "medium",
    tags: ["Performance", "Development"],
    assignee: { name: "Alice", avatar: "/professional-woman.png" },
    dueDate: "Jan 21",
    comments: 6,
    attachments: 3,
  },
  {
    id: "6",
    title: "Mobile responsive design",
    description: "Ensure all pages work flawlessly on mobile devices",
    columnId: "review",
    priority: "low",
    tags: ["Design", "Mobile"],
    assignee: { name: "Bob", avatar: "/professional-man.png" },
    dueDate: "Jan 23",
    comments: 2,
    attachments: 5,
  },
  {
    id: "7",
    title: "Setup CI/CD pipeline",
    description: "Configure automated testing and deployment workflows",
    columnId: "done",
    priority: "high",
    tags: ["DevOps", "Infrastructure"],
    assignee: { name: "Carol", avatar: "/woman-developer.png" },
    dueDate: "Jan 15",
    comments: 10,
    attachments: 2,
  },
  {
    id: "8",
    title: "Logo redesign",
    description: "Create new brand logo variations for different contexts",
    columnId: "done",
    priority: "medium",
    tags: ["Design", "Branding"],
    assignee: { name: "David", avatar: "/man-designer.png" },
    dueDate: "Jan 14",
    comments: 15,
    attachments: 8,
  },
]

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
  }

  const handleDrop = (columnId: string) => {
    if (draggedTask) {
      setTasks((prev) => prev.map((task) => (task.id === draggedTask.id ? { ...task, columnId } : task)))
      setDraggedTask(null)
    }
  }

  return (
    <div className="flex-1 p-4 lg:p-8 pt-0 overflow-x-auto">
      <div className="flex gap-6 min-w-max pb-4">
        {initialColumns.map((column, index) => (
          <TaskColumn
            key={column.id}
            column={column}
            tasks={tasks.filter((task) => task.columnId === column.id)}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            draggedTask={draggedTask}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

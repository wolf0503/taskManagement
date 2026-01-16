export interface Task {
  id: string
  title: string
  description: string
  columnId: string
  priority: "high" | "medium" | "low"
  tags: string[]
  assignee: {
    name: string
    avatar: string
  }
  dueDate: string
  comments: number
  attachments: number
}

export interface Column {
  id: string
  title: string
  color: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: "in-progress" | "completed" | "on-hold" | "planning"
  color: string
  teamMembers: {
    name: string
    avatar: string
  }[]
  taskCount?: number
  completedTasks?: number
  createdAt?: string
}

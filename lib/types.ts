/**
 * Type definitions matching backend API contract
 */

// Enums
export type ProjectStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'PLANNING'
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
export type UserStatus = 'ONLINE' | 'AWAY' | 'OFFLINE'
export type NotificationType = 
  | 'TASK_ASSIGNED' 
  | 'TASK_UPDATED' 
  | 'TASK_COMPLETED'
  | 'COMMENT_ADDED' 
  | 'MENTION' 
  | 'DEADLINE'
  | 'PROJECT_INVITATION' 
  | 'TEAM_INVITATION'
  | 'MEMBER_JOINED' 
  | 'MEMBER_LEFT'

// User
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string | null
  status: UserStatus
  emailVerified?: boolean
  twoFactorEnabled?: boolean
  bio?: string | null
  location?: string | null
  phone?: string | null
  createdAt?: string
  updatedAt?: string
}

// Project
export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  color: string
  ownerId?: string
  taskCount?: number
  completedTasks?: number
  startDate?: string | null
  endDate?: string | null
  createdAt?: string
  updatedAt?: string
}

// Project Member (API contract: list/add/update member responses)
/** User when nested inside ProjectMember (API always populates this) */
export interface ProjectMemberUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar: string | null
  status?: string
}

export interface ProjectMember {
  id: string
  userId: string
  projectId: string
  role: ProjectRole
  joinedAt: string
  user: ProjectMemberUser
}

/** Success response for a single member */
export interface ProjectMemberResponse {
  success: true
  data: ProjectMember
  message?: string
}

/** Success response for list of members */
export interface ProjectMemberListResponse {
  success: true
  data: ProjectMember[]
  message?: string
}

// Task
export interface Task {
  id: string
  title: string
  description?: string | null
  projectId: string
  columnId: string
  priority: TaskPriority
  tags: string[]
  assigneeId?: string | null
  assignee?: User
  dueDate?: string | null
  estimatedHours?: number | null
  position: number
  completedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

// Column
export interface Column {
  id: string
  title: string
  color: string
  projectId?: string
  position?: number
  createdAt?: string
  updatedAt?: string
}

// Notification
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  actionUrl?: string | null
  data?: any
  createdAt: string
  updatedAt?: string
}

// Project Stats
export interface ProjectStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  overdueTasks: number
  completionPercentage: number
}

// Auth Response
export interface AuthResponse {
  user: User
  accessToken: string
}

// Pagination Meta
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

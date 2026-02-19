/**
 * Teams Service
 * Fetches team members (users) from the backend API for the Team page.
 */

import { usersService } from '@/services/users.service'
import type { User } from '@/lib/types'

/** Display shape for a team member on the Teams page (maps from API User) */
export interface TeamMemberFromApi {
  id: string
  name: string
  role: string
  email: string
  phone: string
  location: string
  avatar: string
  status: string
  projects: string[]
  joinedDate: string
  tasksCompleted: number
  department: string
}

function formatJoinedDate(createdAt: string | undefined): string {
  if (!createdAt) return '—'
  try {
    const d = new Date(createdAt)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

function mapStatus(status: string | undefined): string {
  if (!status) return 'offline'
  const s = status.toUpperCase()
  if (s === 'ONLINE') return 'online'
  if (s === 'AWAY') return 'away'
  return 'offline'
}

/**
 * Get all team members from the backend (GET /users).
 * Maps API User[] to the TeamMember shape used by the Teams page.
 */
export async function getTeamMembers(): Promise<TeamMemberFromApi[]> {
  const users = await usersService.getUsers()
  return users.map((u: User) => ({
    id: u.id,
    name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.id,
    role: 'Member',
    email: u.email,
    phone: u.phone ?? '—',
    location: u.location ?? '—',
    avatar: u.avatar ?? '/placeholder.svg',
    status: mapStatus(u.status),
    projects: [],
    joinedDate: formatJoinedDate(u.createdAt),
    tasksCompleted: 0,
    department: 'General',
  }))
}

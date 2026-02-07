"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { projectsService } from "@/services/projects.service"
import { usersService } from "@/services/users.service"
import { toast } from "@/hooks/use-toast"
import type { ProjectMember, ProjectRole, User } from "@/lib/types"
import { UserPlus, Loader2, Trash2 } from "lucide-react"
import { ApiError } from "@/lib/api-client"

const ROLES: { value: ProjectRole; label: string }[] = [
  { value: "VIEWER", label: "Viewer" },
  { value: "MEMBER", label: "Member" },
  { value: "ADMIN", label: "Admin" },
  { value: "OWNER", label: "Owner" },
]

interface AddProjectMembersDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onMembersChange?: (members: ProjectMember[]) => void
}

function userDisplayName(u: User): string {
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ")
  return full || u.email || u.id
}

export function AddProjectMembersDialog({
  projectId,
  open,
  onOpenChange,
  onMembersChange,
}: AddProjectMembersDialogProps) {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [adding, setAdding] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [role, setRole] = useState<ProjectRole>("MEMBER")

  // Users that are not already project members (available to add)
  const availableUsers = useMemo(() => {
    const memberIds = new Set(members.map((m) => m.userId))
    return allUsers.filter((u) => !memberIds.has(u.id))
  }, [allUsers, members])

  const loadMembers = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const list = await projectsService.getProjectMembers(projectId)
      setMembers(list)
      onMembersChange?.(list)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load members"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const list = await usersService.getUsers()
      setAllUsers(list)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load users"
      toast({ title: "Error", description: message, variant: "destructive" })
      setAllUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    if (open && projectId) {
      loadMembers()
      loadUsers()
    }
  }, [open, projectId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) {
      toast({ title: "Error", description: "Select a user to add", variant: "destructive" })
      return
    }
    setAdding(true)
    try {
      await projectsService.addMember(projectId, { userId: selectedUserId, role })
      toast({ title: "Member added", description: "The member was added to the project." })
      setSelectedUserId("")
      setRole("MEMBER")
      await loadMembers()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to add member"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (memberUserId: string) => {
    try {
      await projectsService.removeMember(projectId, memberUserId)
      toast({ title: "Member removed", description: "The member was removed from the project." })
      await loadMembers()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to remove member"
      toast({ title: "Error", description: message, variant: "destructive" })
    }
  }

  const displayName = (m: ProjectMember) => {
    const u = m.user
    if (!u) return m.userId
    const full = [u.firstName, u.lastName].filter(Boolean).join(" ")
    return full || u.email || m.userId
  }

  const displayEmail = (m: ProjectMember) => m.user?.email ?? ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Project members
          </DialogTitle>
          <DialogDescription>
            Add or remove members and manage their roles.
          </DialogDescription>
        </DialogHeader>

        {/* Add member form: select from list of all users */}
        <form onSubmit={handleAdd} className="space-y-3 border-b border-border pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>User</Label>
              <Select
                value={selectedUserId || undefined}
                onValueChange={setSelectedUserId}
                disabled={adding || loadingUsers}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingUsers ? "Loading users…" : "Select a user to add…"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <p className="py-4 px-2 text-sm text-muted-foreground text-center">
                      {allUsers.length === 0 ? "No users found." : "All users are already members."}
                    </p>
                  ) : (
                    <ScrollArea className="h-[240px]">
                      {availableUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {userDisplayName(u)}
                          {u.email ? ` (${u.email})` : ""}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as ProjectRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={adding || !selectedUserId} className="w-full sm:w-auto gap-2">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Add member
          </Button>
        </form>

        {/* Members list */}
        <div className="space-y-2">
          <Label>Current members ({members.length})</Label>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No members yet. Add one above.
            </p>
          ) : (
            <ul className="space-y-2 max-h-[240px] overflow-y-auto">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={m.user?.avatar ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {displayName(m)[0]?.toUpperCase() ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>
                        {displayName(m)}
                        {displayEmail(m) ? ` · ${displayEmail(m)}` : ""}
                      </TooltipContent>
                    </Tooltip>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{displayName(m)}</p>
                      {displayEmail(m) && (
                        <p className="text-xs text-muted-foreground truncate">{displayEmail(m)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted">
                      {ROLES.find((r) => r.value === m.role)?.label ?? m.role}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(m.userId)}
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

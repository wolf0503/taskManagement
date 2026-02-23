"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  Search,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  MoreVertical,
  UserPlus,
  Filter,
  Download,
  Grid3x3,
  List,
  Pencil,
  ListTodo,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getTeamMembers, type TeamMemberFromApi } from "@/services/teams.service"

// Use API-backed type for team member display
type TeamMember = TeamMemberFromApi

const LOCAL_ADDED_KEY = "teamMembersAdded"

function getLocalTeamMembersAdded(): TeamMember[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LOCAL_ADDED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalTeamMembersAdded(list: TeamMember[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LOCAL_ADDED_KEY, JSON.stringify(list))
  } catch {
    // ignore
  }
}

function mergeWithLocal(apiList: TeamMember[], localAdded: TeamMember[]): TeamMember[] {
  const apiEmails = new Set(apiList.map((m) => m.email.toLowerCase()))
  const onlyLocal = localAdded.filter((m) => !apiEmails.has(m.email.toLowerCase()))
  return [...apiList, ...onlyLocal]
}

export default function TeamsPage() {
  const { user, getAvatarUrl } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [profileMember, setProfileMember] = useState<TeamMember | null>(null)
  const [messageMember, setMessageMember] = useState<TeamMember | null>(null)
  const [assignTaskMember, setAssignTaskMember] = useState<TeamMember | null>(null)
  const [removeMember, setRemoveMember] = useState<TeamMember | null>(null)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    location: "",
    department: "",
  })
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersError, setMembersError] = useState<string | null>(null)
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    location: "",
    department: "",
  })

  // Fetch team members from backend API and merge with locally added (saved) members
  useEffect(() => {
    let cancelled = false
    setMembersLoading(true)
    setMembersError(null)
    getTeamMembers()
      .then((data) => {
        if (!cancelled) {
          const localAdded = getLocalTeamMembersAdded()
          setTeamMembers(mergeWithLocal(data, localAdded))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setMembersError(err?.message ?? "Failed to load team members")
          const localAdded = getLocalTeamMembersAdded()
          setTeamMembers(localAdded)
        }
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const filteredMembers = teamMembers.filter((member: TeamMember) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment =
      selectedDepartment === "all" || member.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-status-done"
      case "away":
        return "bg-accent"
      case "offline":
        return "bg-muted-foreground"
      default:
        return "bg-muted-foreground"
    }
  }

  /** Use fresh avatar from auth for current user so Team shows updated photo after profile change */
  const getMemberAvatarUrl = (member: TeamMember): string => {
    if (user && (member.id === user.id || member.email === user.email)) {
      return getAvatarUrl() ?? member.avatar
    }
    return member.avatar
  }

  /** First letter of first name + first letter of last name, e.g. "John Smith" → "JS" */
  const getMemberInitials = (member: TeamMember): string => {
    const parts = member.name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "?"
    const first = parts[0][0] ?? ""
    const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : first
    return (first + last).toUpperCase()
  }

  /** True if we have a real avatar URL to show (not placeholder) */
  const hasRealAvatar = (member: TeamMember): boolean => {
    const url = getMemberAvatarUrl(member)
    return Boolean(url && !url.includes("placeholder"))
  }

  const handleAddMember = () => {
    // Create a new member object with all required fields
    const currentDate = new Date()
    const monthYear = currentDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })

    const newMemberData: TeamMember = {
      id: `local-${Date.now()}`,
      name: newMember.name,
      role: newMember.role,
      email: newMember.email.trim(),
      phone: newMember.phone || "—",
      location: newMember.location || "—",
      avatar: "/placeholder.svg",
      status: "online",
      projects: [],
      joinedDate: monthYear,
      tasksCompleted: 0,
      department: newMember.department,
    }

    // Add to state and persist so it survives refresh
    const nextList = [...teamMembers, newMemberData]
    setTeamMembers(nextList)
    saveLocalTeamMembersAdded(getLocalTeamMembersAdded().concat(newMemberData))

    // Reset form and close dialog
    setIsAddMemberOpen(false)
    setNewMember({
      name: "",
      role: "",
      email: "",
      phone: "",
      location: "",
      department: "",
    })
  }

  const handleViewProfile = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId)
    if (member) setProfileMember(member)
  }

  const handleSendMessage = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId)
    if (member) setMessageMember(member)
  }

  const handleConfirmSendMessage = () => {
    if (messageMember) {
      window.location.href = `mailto:${messageMember.email}?subject=Message from Team`
      setMessageMember(null)
    }
  }

  const handleAssignTask = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId)
    if (member) setAssignTaskMember(member)
  }

  const handleRemoveMemberConfirm = () => {
    if (!removeMember) return
    const memberId = removeMember.id
    const nextList = teamMembers.filter((m: TeamMember) => m.id !== memberId)
    setTeamMembers(nextList)
    saveLocalTeamMembersAdded(nextList.filter((m) => m.id.startsWith("local-")))
    setRemoveMember(null)
  }

  const handleEditMember = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId)
    if (member) {
      setEditingMember(member)
      setEditForm({
        name: member.name,
        role: member.role,
        email: member.email,
        phone: member.phone === "—" ? "" : member.phone,
        location: member.location === "—" ? "" : member.location,
        department: member.department,
      })
    }
  }

  const handleSaveEditMember = () => {
    if (!editingMember) return
    const updated: TeamMember = {
      ...editingMember,
      name: editForm.name.trim(),
      role: editForm.role.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim() || "—",
      location: editForm.location.trim() || "—",
      department: editForm.department,
    }
    const nextList = teamMembers.map((m) => (m.id === editingMember.id ? updated : m))
    setTeamMembers(nextList)
    const localAdded = getLocalTeamMembersAdded()
    const updatedLocal = localAdded.map((m) => (m.id === editingMember.id ? updated : m))
    saveLocalTeamMembersAdded(updatedLocal)
    setEditingMember(null)
  }

  const handleDeleteMember = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId)
    if (member) setRemoveMember(member)
  }

  return (
    <div className="min-h-screen animated-gradient-bg flex">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full bg-chart-4/10 blur-[100px] animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out w-full",
          "pl-0 lg:pl-64",
          sidebarCollapsed && "lg:pl-20"
        )}
      >
        {/* Header */}
        <div className="px-4 lg:px-8 py-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Team Members</h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredMembers.length} active members
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-4 lg:px-8 pb-6">
          {membersError && (
            <Card className="glass border-glass-border border-destructive/50 mb-6">
              <CardContent className="flex items-center gap-3 py-4">
                <p className="text-sm text-destructive flex-1">{membersError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMembersError(null)
                    setMembersLoading(true)
                    getTeamMembers()
                      .then(setTeamMembers)
                      .catch((err) => setMembersError(err?.message ?? "Failed to load team members"))
                      .finally(() => setMembersLoading(false))
                  }}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}
          <div className="glass rounded-xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, role, or email..."
                  className="pl-10 glass-subtle border-glass-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={membersLoading}
                />
              </div>
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full lg:w-[180px] glass-subtle border-glass-border">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="glass border-glass-border">
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1 p-1 glass-subtle rounded-lg border border-glass-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8", viewMode === "grid" && "bg-primary/20 text-primary")}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
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
            </div>
          </div>

          {/* Team Members Grid/List */}
          {membersLoading ? (
            <Card className="glass border-glass-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
                <p className="text-sm text-muted-foreground">Loading team members...</p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member: TeamMember) => (
                <Card
                  key={member.id}
                  className="glass border-glass-border hover:border-primary/50 transition-all group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 ring-2 ring-background">
                            <AvatarImage src={hasRealAvatar(member) ? getMemberAvatarUrl(member) : undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                              {getMemberInitials(member)}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background",
                              getStatusColor(member.status)
                            )}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-base">{member.name}</CardTitle>
                          <CardDescription className="text-xs">{member.role}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass border-glass-border">
                          <DropdownMenuItem onClick={() => handleViewProfile(member.id)}>View Profile</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendMessage(member.id)}>Send Message</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignTask(member.id)}>Assign Task</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditMember(member.id)}>Edit Member</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-xs truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs">{member.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs">{member.department}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Active Projects</span>
                        <Badge variant="secondary" className="text-xs">
                          {member.projects.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {member.projects.slice(0, 2).map((project: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-primary/5 border-primary/20"
                          >
                            {project}
                          </Badge>
                        ))}
                        {member.projects.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.projects.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {member.joinedDate}</span>
                      </div>
                      <div className="text-xs font-medium">
                        {member.tasksCompleted} tasks
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member: TeamMember) => (
                <Card
                  key={member.id}
                  className="glass border-glass-border hover:border-primary/50 transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-2 ring-background">
                          <AvatarImage src={hasRealAvatar(member) ? getMemberAvatarUrl(member) : undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary text-base font-medium">
                            {getMemberInitials(member)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-background",
                            getStatusColor(member.status)
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{member.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {member.department}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {member.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {member.joinedDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{member.tasksCompleted}</div>
                          <div className="text-xs text-muted-foreground">Tasks</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{member.projects.length}</div>
                          <div className="text-xs text-muted-foreground">Projects</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass border-glass-border">
                            <DropdownMenuItem onClick={() => handleViewProfile(member.id)}>View Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendMessage(member.id)}>Send Message</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignTask(member.id)}>Assign Task</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditMember(member.id)}>Edit Member</DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredMembers.length === 0 && (
            <Card className="glass border-glass-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No team members found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="border-glass-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new member to your team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@company.com"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                placeholder="Senior Developer"
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={newMember.department}
                onValueChange={(value) => setNewMember({ ...newMember, department: value })}
              >
                <SelectTrigger className="glass-subtle border-glass-border">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="glass border-glass-border">
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="San Francisco, CA"
                value={newMember.location}
                onChange={(e) => setNewMember({ ...newMember, location: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={!newMember.name || !newMember.email || !newMember.role || !newMember.department}
              className="bg-primary hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={!!messageMember} onOpenChange={(open) => !open && setMessageMember(null)}>
        <DialogContent className="border-glass-border sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              {messageMember
                ? `Open your email client to send a message to ${messageMember.name}.`
                : "Open your email client to send a message."}
            </DialogDescription>
          </DialogHeader>
          {messageMember && (
            <div className="flex items-center gap-3 py-2">
              <Avatar className="h-10 w-10 ring-2 ring-background shrink-0">
                <AvatarImage src={hasRealAvatar(messageMember) ? getMemberAvatarUrl(messageMember) : undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                  {getMemberInitials(messageMember)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium truncate">{messageMember.name}</p>
                <p className="text-sm text-muted-foreground truncate">{messageMember.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageMember(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSendMessage} className="bg-primary hover:bg-primary/90">
              <Mail className="h-4 w-4 mr-2" />
              Open email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={!!assignTaskMember} onOpenChange={(open) => !open && setAssignTaskMember(null)}>
        <DialogContent className="border-glass-border sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              {assignTaskMember
                ? `Assign a task to ${assignTaskMember.name}. This feature will open the task assignment flow.`
                : "Assign a task to this team member."}
            </DialogDescription>
          </DialogHeader>
          {assignTaskMember && (
            <div className="flex items-center gap-3 py-2">
              <Avatar className="h-10 w-10 ring-2 ring-background shrink-0">
                <AvatarImage src={hasRealAvatar(assignTaskMember) ? getMemberAvatarUrl(assignTaskMember) : undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                  {getMemberInitials(assignTaskMember)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium truncate">{assignTaskMember.name}</p>
                <p className="text-sm text-muted-foreground">{assignTaskMember.role}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTaskMember(null)}>
              Close
            </Button>
            <Button
              onClick={() => setAssignTaskMember(null)}
              className="bg-primary hover:bg-primary/90"
            >
              <ListTodo className="h-4 w-4 mr-2" />
              Assign task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={!!removeMember} onOpenChange={(open) => !open && setRemoveMember(null)}>
        <DialogContent className="border-glass-border sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              {removeMember
                ? `Are you sure you want to remove ${removeMember.name} from the team? This action cannot be undone.`
                : "Are you sure you want to remove this team member?"}
            </DialogDescription>
          </DialogHeader>
          {removeMember && (
            <div className="flex items-center gap-3 py-2">
              <Avatar className="h-10 w-10 ring-2 ring-background shrink-0">
                <AvatarImage src={hasRealAvatar(removeMember) ? getMemberAvatarUrl(removeMember) : undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                  {getMemberInitials(removeMember)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium truncate">{removeMember.name}</p>
                <p className="text-sm text-muted-foreground truncate">{removeMember.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveMember(null)}>
              No
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMemberConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={!!profileMember} onOpenChange={(open) => !open && setProfileMember(null)}>
        <DialogContent className="border-glass-border sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>
              Team member details
            </DialogDescription>
          </DialogHeader>
          {profileMember && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-background shrink-0">
                  <AvatarImage src={hasRealAvatar(profileMember) ? getMemberAvatarUrl(profileMember) : undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-lg font-medium">
                    {getMemberInitials(profileMember)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-lg truncate">{profileMember.name}</p>
                  <p className="text-sm text-muted-foreground">{profileMember.role}</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm border-t border-border pt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profileMember.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{profileMember.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span>{profileMember.department}</span>
                </div>
                {profileMember.phone && profileMember.phone !== "—" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider w-4">Tel</span>
                    <span>{profileMember.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Joined {profileMember.joinedDate}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Tasks completed</span>
                  <span className="font-medium">{profileMember.tasksCompleted}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileMember(null)}>
              Close
            </Button>
            {profileMember && (
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  setProfileMember(null)
                  setEditingMember(profileMember)
                  setEditForm({
                    name: profileMember.name,
                    role: profileMember.role,
                    email: profileMember.email,
                    phone: profileMember.phone === "—" ? "" : profileMember.phone,
                    location: profileMember.location === "—" ? "" : profileMember.location,
                    department: profileMember.department,
                  })
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit member
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="border-glass-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update the member details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                placeholder="John Doe"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="john.doe@company.com"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Input
                id="edit-role"
                placeholder="Senior Developer"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Department *</Label>
              <Select
                value={editForm.department}
                onValueChange={(value) => setEditForm({ ...editForm, department: value })}
              >
                <SelectTrigger className="glass-subtle border-glass-border">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="glass border-glass-border">
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                placeholder="+1 (555) 123-4567"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                placeholder="San Francisco, CA"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditMember}
              disabled={!editForm.name || !editForm.email || !editForm.role || !editForm.department}
              className="bg-primary hover:bg-primary/90"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

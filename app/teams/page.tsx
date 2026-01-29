"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
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
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  MoreVertical,
  UserPlus,
  Filter,
  Download,
  Grid3x3,
  List,
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

// Team member type
interface TeamMember {
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

// Mock team members data - initial data
const initialTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Product Manager",
    email: "sarah.j@company.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    avatar: "/professional-woman.png",
    status: "online",
    projects: ["Website Redesign", "Mobile App"],
    joinedDate: "Jan 2023",
    tasksCompleted: 127,
    department: "Product",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Senior Developer",
    email: "m.chen@company.com",
    phone: "+1 (555) 234-5678",
    location: "New York, NY",
    avatar: "/professional-man.png",
    status: "online",
    projects: ["Website Redesign", "API Integration"],
    joinedDate: "Mar 2022",
    tasksCompleted: 243,
    department: "Engineering",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "UX Designer",
    email: "emily.r@company.com",
    phone: "+1 (555) 345-6789",
    location: "Austin, TX",
    avatar: "/woman-developer.png",
    status: "away",
    projects: ["Mobile App", "Marketing"],
    joinedDate: "Jun 2023",
    tasksCompleted: 89,
    department: "Design",
  },
  {
    id: "4",
    name: "David Park",
    role: "DevOps Engineer",
    email: "d.park@company.com",
    phone: "+1 (555) 456-7890",
    location: "Seattle, WA",
    avatar: "/man-designer.png",
    status: "online",
    projects: ["Infrastructure", "API Integration"],
    joinedDate: "Feb 2022",
    tasksCompleted: 156,
    department: "Engineering",
  },
  {
    id: "5",
    name: "Jessica Taylor",
    role: "Marketing Lead",
    email: "j.taylor@company.com",
    phone: "+1 (555) 567-8901",
    location: "Los Angeles, CA",
    avatar: "/professional-avatar.png",
    status: "offline",
    projects: ["Marketing", "Content Strategy"],
    joinedDate: "Aug 2023",
    tasksCompleted: 72,
    department: "Marketing",
  },
  {
    id: "6",
    name: "Alex Kumar",
    role: "Full Stack Developer",
    email: "a.kumar@company.com",
    phone: "+1 (555) 678-9012",
    location: "Chicago, IL",
    avatar: "/professional-man.png",
    status: "online",
    projects: ["Website Redesign", "Mobile App"],
    joinedDate: "Nov 2022",
    tasksCompleted: 198,
    department: "Engineering",
  },
]

export default function TeamsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('teamMembers')
      return saved ? JSON.parse(saved) : initialTeamMembers
    }
    return initialTeamMembers
  })
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    location: "",
    department: "",
  })

  // Save to localStorage whenever teamMembers change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('teamMembers', JSON.stringify(teamMembers))
    }
  }, [teamMembers])

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

  const handleAddMember = () => {
    // Create a new member object with all required fields
    const currentDate = new Date()
    const monthYear = currentDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })

    const newMemberData = {
      id: String(teamMembers.length + 1),
      name: newMember.name,
      role: newMember.role,
      email: newMember.email,
      phone: newMember.phone || "N/A",
      location: newMember.location || "Remote",
      avatar: "/professional-avatar.png",
      status: "online",
      projects: [],
      joinedDate: monthYear,
      tasksCompleted: 0,
      department: newMember.department,
    }

    // Add the new member to the team
    setTeamMembers([...teamMembers, newMemberData])

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
    if (member) {
      alert(`Profile: ${member.name}\nRole: ${member.role}\nEmail: ${member.email}\nPhone: ${member.phone}\nLocation: ${member.location}\nDepartment: ${member.department}\nJoined: ${member.joinedDate}\nTasks Completed: ${member.tasksCompleted}`)
    }
  }

  const handleSendMessage = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId)
    if (member) {
      window.location.href = `mailto:${member.email}?subject=Message from Team`
    }
  }

  const handleAssignTask = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId)
    if (member) {
      alert(`Assign task to ${member.name}\n\nThis feature will open a task assignment dialog.`)
    }
  }

  const handleEditMember = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId)
    if (member) {
      alert(`Edit member: ${member.name}\n\nThis feature will open an edit dialog to modify member details.`)
    }
  }

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter((m: TeamMember) => m.id !== memberId))
    }
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
          <div className="glass rounded-xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, role, or email..."
                  className="pl-10 glass-subtle border-glass-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
          {viewMode === "grid" ? (
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
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {member.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
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
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {member.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
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
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  FolderKanban,
  MessageSquare,
  Activity,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  Share2,
} from "lucide-react"

const ProgressDoughnutChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => ({ default: m.ProgressDoughnutChart })),
  { ssr: false }
)
const ProjectsProgressBarChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => ({ default: m.ProjectsProgressBarChart })),
  { ssr: false }
)
const TimeLoggedByProjectChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => ({ default: m.TimeLoggedByProjectChart })),
  { ssr: false }
)

// Dashboard project type
interface DashboardProject {
  id: string
  name: string
  color: string
  completionRate: number
  tasksCompleted: number
  totalTasks: number
  activeMembers: number
  trend: string
  trendUp: boolean
  lastActivity: string
  description?: string
  stats: {
    todo: number
    inProgress: number
    done: number
    velocity: string
    timeSpent: string
    estimatedTime: string
    blockers: number
  }
  recentComments: Array<{
    user: string
    avatar: string
    text: string
    time: string
  }>
}

// Mock project statistics
const projectStats: DashboardProject[] = [
  {
    id: "1",
    name: "Website Redesign",
    color: "bg-chart-1",
    completionRate: 25,
    tasksCompleted: 2,
    totalTasks: 8,
    activeMembers: 4,
    trend: "+12%",
    trendUp: true,
    lastActivity: "2 hours ago",
    stats: {
      todo: 3,
      inProgress: 3,
      done: 2,
      velocity: "2.5 tasks/week",
      timeSpent: "32h",
      estimatedTime: "120h",
      blockers: 0,
    },
    recentComments: [
      { user: "Alice", avatar: "/professional-woman.png", text: "UI mockups are ready for review", time: "2h ago" },
      { user: "Bob", avatar: "/professional-man.png", text: "Working on responsive design", time: "4h ago" },
    ]
  },
  {
    id: "2",
    name: "Mobile App",
    color: "bg-chart-2",
    completionRate: 42,
    tasksCompleted: 5,
    totalTasks: 12,
    activeMembers: 2,
    trend: "+8%",
    trendUp: true,
    lastActivity: "1 hour ago",
    stats: {
      todo: 4,
      inProgress: 3,
      done: 5,
      velocity: "1.5 tasks/week",
      timeSpent: "58h",
      estimatedTime: "140h",
      blockers: 1,
    },
    recentComments: [
      { user: "Alice", avatar: "/professional-woman.png", text: "API integration completed", time: "1h ago" },
    ]
  },
  {
    id: "3",
    name: "Marketing Campaign",
    color: "bg-chart-3",
    completionRate: 0,
    tasksCompleted: 0,
    totalTasks: 6,
    activeMembers: 1,
    trend: "0%",
    trendUp: true,
    lastActivity: "1 day ago",
    stats: {
      todo: 6,
      inProgress: 0,
      done: 0,
      velocity: "0 tasks/week",
      timeSpent: "0h",
      estimatedTime: "80h",
      blockers: 0,
    },
    recentComments: [
      { user: "Carol", avatar: "/woman-developer.png", text: "Planning phase in progress", time: "1d ago" },
    ]
  },
  {
    id: "4",
    name: "API Development",
    color: "bg-chart-4",
    completionRate: 100,
    tasksCompleted: 15,
    totalTasks: 15,
    activeMembers: 2,
    trend: "+100%",
    trendUp: true,
    lastActivity: "Completed",
    stats: {
      todo: 0,
      inProgress: 0,
      done: 15,
      velocity: "3 tasks/week",
      timeSpent: "180h",
      estimatedTime: "180h",
      blockers: 0,
    },
    recentComments: [
      { user: "David", avatar: "/man-designer.png", text: "Documentation complete", time: "2d ago" },
    ]
  },
  {
    id: "5",
    name: "Database Migration",
    color: "bg-chart-5",
    completionRate: 30,
    tasksCompleted: 3,
    totalTasks: 10,
    activeMembers: 2,
    trend: "-5%",
    trendUp: false,
    lastActivity: "5 hours ago",
    stats: {
      todo: 4,
      inProgress: 3,
      done: 3,
      velocity: "1 task/week",
      timeSpent: "45h",
      estimatedTime: "150h",
      blockers: 2,
    },
    recentComments: [
      { user: "Bob", avatar: "/professional-man.png", text: "Migration scripts ready", time: "5h ago" },
    ]
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [createDashboardOpen, setCreateDashboardOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [projects, setProjects] = useState(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboardProjects')
      return saved ? JSON.parse(saved) : projectStats
    }
    return projectStats
  })
  const [newDashboardName, setNewDashboardName] = useState("")
  const [newDashboardDescription, setNewDashboardDescription] = useState("")
  const [editDashboardName, setEditDashboardName] = useState("")
  const [editDashboardDescription, setEditDashboardDescription] = useState("")
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [projectComments, setProjectComments] = useState<Record<string, any[]>>(
    projectStats.reduce((acc, project) => ({
      ...acc,
      [project.id]: project.recentComments
    }), {})
  )

  // Save to localStorage whenever projects change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardProjects', JSON.stringify(projects))
    }
  }, [projects])

  const handlePostComment = (projectId: string) => {
    const commentText = commentTexts[projectId]?.trim()
    if (!commentText) return

    const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "User"
    const newComment = {
      user: displayName,
      avatar: user?.avatar ?? "/professional-avatar.png",
      text: commentText,
      time: "Just now"
    }

    setProjectComments(prev => ({
      ...prev,
      [projectId]: [newComment, ...(prev[projectId] || [])]
    }))

    setCommentTexts(prev => ({
      ...prev,
      [projectId]: ""
    }))
  }

  const handleCreateDashboard = () => {
    if (!newDashboardName.trim()) return

    const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
    const newDashboard = {
      id: String(projects.length + 1),
      name: newDashboardName,
      description: newDashboardDescription,
      color: colors[projects.length % colors.length],
      completionRate: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      activeMembers: 1,
      trend: "0%",
      trendUp: true,
      lastActivity: "Just now",
      stats: {
        todo: 0,
        inProgress: 0,
        done: 0,
        velocity: "0 tasks/week",
        timeSpent: "0h",
        estimatedTime: "0h",
        blockers: 0,
      },
      recentComments: []
    }

    setProjects([...projects, newDashboard])
    setNewDashboardName("")
    setNewDashboardDescription("")
    setCreateDashboardOpen(false)
  }

  const handleDuplicateDashboard = (projectId: string) => {
    const projectToDuplicate = projects.find((p: DashboardProject) => p.id === projectId)
    if (!projectToDuplicate) return

    const newDashboard = {
      ...projectToDuplicate,
      id: String(projects.length + 1),
      name: `${projectToDuplicate.name} (Copy)`,
      lastActivity: "Just now"
    }

    setProjects([...projects, newDashboard])
  }

  const handleDeleteDashboard = (projectId: string) => {
    setProjects(projects.filter((p: DashboardProject) => p.id !== projectId))
  }

  const handleShareDashboard = (projectId: string) => {
    const project = projects.find((p: DashboardProject) => p.id === projectId)
    if (!project) return
    
    const shareUrl = `${window.location.origin}/dashboard/${projectId}`
    navigator.clipboard.writeText(shareUrl)
    alert(`Link copied to clipboard: ${shareUrl}`)
  }

  const handleExportData = (projectId: string) => {
    const project = projects.find((p: DashboardProject) => p.id === projectId)
    if (!project) return

    const dataStr = JSON.stringify(project, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-dashboard.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleEditDashboard = () => {
    if (!editingProject || !editDashboardName.trim()) return

    setProjects(projects.map((p: DashboardProject) => 
      p.id === editingProject 
        ? { 
            ...p, 
            name: editDashboardName,
            description: editDashboardDescription 
          }
        : p
    ))
    
    setEditingProject(null)
    setEditDashboardName("")
    setEditDashboardDescription("")
  }

  const openEditDialog = (projectId: string) => {
    const project = projects.find((p: DashboardProject) => p.id === projectId)
    if (project) {
      setEditDashboardName(project.name)
      setEditDashboardDescription((project as any).description || `Dashboard for ${project.name}`)
      setEditingProject(projectId)
    }
  }

  // Derived metrics from actual project data
  const totalTasks = projects.reduce((sum: number, p: DashboardProject) => sum + p.totalTasks, 0)
  const completedTasks = projects.reduce((sum: number, p: DashboardProject) => sum + p.tasksCompleted, 0)
  const activeTasks = projects.reduce((sum: number, p: DashboardProject) => sum + p.stats.inProgress, 0)
  const todoTasks = projects.reduce((sum: number, p: DashboardProject) => sum + p.stats.todo, 0)
  const totalMembers = projects.reduce((sum: number, p: DashboardProject) => sum + p.activeMembers, 0)
  const projectsCompleted = projects.filter((p: DashboardProject) => p.completionRate === 100).length
  const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const overallStats = [
    {
      title: "Projects",
      value: String(projects.length),
      detail: projectsCompleted > 0 ? `${projectsCompleted} completed` : "in progress",
      icon: FolderKanban,
      color: "text-chart-1",
      bgColor: "bg-chart-1/15",
      borderColor: "border-chart-1/30",
    },
    {
      title: "Active now",
      value: String(activeTasks),
      detail: "tasks in progress",
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/15",
      borderColor: "border-accent/30",
    },
    {
      title: "Completed",
      value: String(completedTasks),
      detail: `of ${totalTasks} total tasks`,
      icon: CheckCircle2,
      color: "text-status-done",
      bgColor: "bg-status-done/15",
      borderColor: "border-status-done/30",
    },
    {
      title: "Team",
      value: String(totalMembers),
      detail: "members across projects",
      icon: Users,
      color: "text-chart-3",
      bgColor: "bg-chart-3/15",
      borderColor: "border-chart-3/30",
    },
  ]

  return (
    <ProtectedRoute>
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
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out w-full",
        "pl-0 lg:pl-64",
        sidebarCollapsed && "lg:pl-20"
      )}>
        {/* Header */}
        <div className="px-4 lg:px-8 py-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Project Dashboards</h1>
                  <p className="text-sm text-muted-foreground">Analytics and insights for all projects</p>
                </div>
              </div>
              <Button className="gap-2" onClick={() => setCreateDashboardOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Stats Grid — modern cards with concrete data */}
        <div className="px-4 lg:px-8 pb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {overallStats.map((stat) => (
              <div
                key={stat.title}
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-xl transition-all hover:bg-card/90",
                  "min-h-[100px] p-5 flex flex-col justify-between",
                  stat.borderColor
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.title}
                  </span>
                  <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", stat.bgColor)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className={cn("text-2xl sm:text-3xl font-bold tabular-nums", stat.color)}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Progress — Chart.js with clear numbers */}
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden mb-6">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-[200px] h-[200px] flex-shrink-0 mx-auto sm:mx-0">
                  <ProgressDoughnutChart completed={completedTasks} total={totalTasks} size={200} />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="text-4xl font-bold text-primary tabular-nums">{overallCompletion}%</div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{completedTasks}</span> of{" "}
                    <span className="font-semibold text-foreground">{totalTasks}</span> tasks completed
                    {todoTasks > 0 && (
                      <> · <span className="font-medium text-foreground">{todoTasks}</span> to do</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Across {projects.length} project{projects.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress by project — Chart.js */}
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden mb-6">
            <div className="p-6 border-b border-border/50">
              <h3 className="text-lg font-semibold">Progress by project</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Completion % per project
              </p>
            </div>
            <div className="p-6 pt-4">
              <div className="h-[220px]">
                <ProjectsProgressBarChart
                  projectNames={projects.map((p: DashboardProject) => p.name)}
                  completionRates={projects.map((p: DashboardProject) => p.completionRate)}
                  height={220}
                />
              </div>
            </div>
          </div>

          {/* Time logged (Log time) — Chart.js */}
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden mb-6">
            <div className="p-6 border-b border-border/50">
              <h3 className="text-lg font-semibold">Time logged</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Logged vs estimated hours per project
              </p>
            </div>
            <div className="p-6 pt-4">
              <div className="h-[260px]">
                <TimeLoggedByProjectChart
                  projectNames={projects.map((p: DashboardProject) => p.name)}
                  loggedHours={projects.map((p: DashboardProject) => parseInt(p.stats.timeSpent, 10) || 0)}
                  estimatedHours={projects.map((p: DashboardProject) => parseInt(p.stats.estimatedTime, 10) || 0)}
                  height={260}
                />
              </div>
            </div>
          </div>

          {/* Project Dashboards */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-1 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Project dashboards</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Click to open metrics and charts
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1 text-xs">
                  <Activity className="h-3 w-3" />
                  {projects.length} dashboard{projects.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project: DashboardProject) => (
                <div
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/dashboard/${project.id}`)}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/dashboard/${project.id}`)}
                  className={cn(
                    "group rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden",
                    "hover:border-primary/40 hover:bg-card/80 transition-all cursor-pointer",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  )}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0", project.color)}>
                          <FolderKanban className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{project.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {project.lastActivity}
                            {project.activeMembers > 0 && (
                              <>
                                <span className="text-border">·</span>
                                <Users className="h-3 w-3" />
                                {project.activeMembers} member{project.activeMembers !== 1 ? "s" : ""}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass border-glass-border w-48">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(project.id); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateDashboard(project.id); }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareDashboard(project.id); }}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleExportData(project.id); }}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteDashboard(project.id); }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Dashboard
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold tabular-nums text-primary">{project.completionRate}%</span>
                        <span className="text-sm text-muted-foreground">
                          {project.tasksCompleted} / {project.totalTasks} tasks
                        </span>
                      </div>
                      {project.completionRate === 100 && (
                        <Badge variant="outline" className="bg-status-done/10 text-status-done border-status-done/30 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                        <div className="text-sm font-semibold text-status-todo tabular-nums">{project.stats.todo}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">To do</div>
                      </div>
                      <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                        <div className="text-sm font-semibold text-accent tabular-nums">{project.stats.inProgress}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Active</div>
                      </div>
                      <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                        <div className="text-sm font-semibold text-status-done tabular-nums">{project.stats.done}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Done</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{project.stats.velocity}</span>
                      <span>{project.stats.timeSpent}h / {project.stats.estimatedTime}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Create Dashboard Dialog */}
      <Dialog open={createDashboardOpen} onOpenChange={setCreateDashboardOpen}>
        <DialogContent className="border-glass-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              Create New Dashboard
            </DialogTitle>
            <DialogDescription>
              Create a new dashboard to visualize and track your project analytics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name">Dashboard Name</Label>
              <Input
                id="dashboard-name"
                placeholder="e.g., Q1 Analytics, Team Performance"
                className="glass-subtle border-glass-border"
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dashboard-description">Description</Label>
              <Textarea
                id="dashboard-description"
                placeholder="Describe the purpose of this dashboard..."
                className="glass-subtle border-glass-border min-h-[100px]"
                value={newDashboardDescription}
                onChange={(e) => setNewDashboardDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Projects</Label>
              <div className="space-y-2">
                {projects.map((project: DashboardProject) => (
                  <label
                    key={project.id}
                    className="flex items-center gap-3 p-3 rounded-lg glass-subtle cursor-pointer hover:bg-primary/5 transition-colors"
                  >
                    <input type="checkbox" className="rounded" defaultChecked />
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", project.color)}>
                      <FolderKanban className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{project.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateDashboardOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDashboard}
              disabled={!newDashboardName.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dashboard Dialog */}
      <Dialog open={editingProject !== null} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="border-glass-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Edit className="h-4 w-4 text-primary" />
              </div>
              Edit Dashboard
            </DialogTitle>
            <DialogDescription>
              Update dashboard settings and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingProject && projects.find((p: DashboardProject) => p.id === editingProject) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-dashboard-name">Dashboard Name</Label>
                  <Input
                    id="edit-dashboard-name"
                    value={editDashboardName}
                    onChange={(e) => setEditDashboardName(e.target.value)}
                    className="glass-subtle border-glass-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dashboard-description">Description</Label>
                  <Textarea
                    id="edit-dashboard-description"
                    value={editDashboardDescription}
                    onChange={(e) => setEditDashboardDescription(e.target.value)}
                    className="glass-subtle border-glass-border min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dashboard Settings</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg glass-subtle cursor-pointer">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Show Task Distribution</div>
                        <div className="text-xs text-muted-foreground">Display task breakdown charts</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg glass-subtle cursor-pointer">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Show Performance Metrics</div>
                        <div className="text-xs text-muted-foreground">Display time and velocity statistics</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg glass-subtle cursor-pointer">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Show Comments</div>
                        <div className="text-xs text-muted-foreground">Display recent activity and comments</div>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingProject(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditDashboard}
              disabled={!editDashboardName.trim()}
            >
              <Edit className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ProtectedRoute>
  )
}

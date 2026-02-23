"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useProjects } from "@/contexts/projects-context"
import { useTasks } from "@/contexts/tasks-context"
import { useColumns } from "@/contexts/columns-context"
import { projectsService } from "@/services/projects.service"
import type { Project, ProjectStats } from "@/lib/types"
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
  Settings,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  getDashboardMetrics,
  setDashboardMetrics,
  DASHBOARD_METRIC_IDS,
  DASHBOARD_METRIC_LABELS,
  type DashboardMetricsConfig,
} from "@/lib/dashboard-metrics"

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

// Dashboard project type (for display; built from Project + stats)
interface DashboardProject {
  id: string
  name: string
  color: string
  status?: string
  statusLabel?: string
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

const PROJECT_STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  PLANNING: "Planning",
}

const CHART_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

/** Run async tasks with a concurrency limit to avoid rate limiting (e.g. 429). */
async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  let index = 0
  async function worker(): Promise<void> {
    while (index < items.length) {
      const i = index++
      try {
        results[i] = await fn(items[i])
      } catch {
        results[i] = undefined as unknown as R
      }
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

function formatLastActivity(updatedAt?: string | null): string {
  if (!updatedAt) return "—"
  try {
    const d = new Date(updatedAt)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  } catch {
    return "—"
  }
}

// Stats computed from tasks/columns when API stats are unavailable
interface ClientProjectStats {
  totalTasks: number
  completedTasks: number
  todoTasks: number
  inProgressTasks: number
}

function mapProjectToDashboard(
  project: Project,
  stats: ProjectStats | null,
  memberCount: number,
  clientStats: ClientProjectStats | null = null
): DashboardProject {
  const totalTasks = stats?.totalTasks ?? clientStats?.totalTasks ?? project.taskCount ?? 0
  const completedTasks = stats?.completedTasks ?? clientStats?.completedTasks ?? project.completedTasks ?? 0
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const color = project.color?.trim() || CHART_COLORS[0]
  return {
    id: project.id,
    name: project.name,
    color,
    status: project.status,
    statusLabel: PROJECT_STATUS_LABELS[project.status] ?? project.status,
    completionRate,
    tasksCompleted: completedTasks,
    totalTasks,
    activeMembers: memberCount,
    trend: completionRate > 0 ? `+${completionRate}%` : "0%",
    trendUp: true,
    lastActivity: formatLastActivity(project.updatedAt),
    description: project.description,
    stats: {
      todo: stats?.todoTasks ?? clientStats?.todoTasks ?? Math.max(0, totalTasks - completedTasks),
      inProgress: stats?.inProgressTasks ?? clientStats?.inProgressTasks ?? 0,
      done: stats?.completedTasks ?? clientStats?.completedTasks ?? completedTasks,
      velocity: "—",
      timeSpent: "0",
      estimatedTime: "0",
      blockers: stats?.overdueTasks ?? 0,
    },
    recentComments: [],
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, getAvatarUrl } = useAuth()
  const { projects: apiProjects, isLoading: projectsLoading, updateProject, deleteProject } = useProjects()
  const { getTasks } = useTasks()
  const { getColumns } = useColumns()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [statsByProjectId, setStatsByProjectId] = useState<Record<string, ProjectStats>>({})
  const [memberCountByProjectId, setMemberCountByProjectId] = useState<Record<string, number>>({})
  const [editDashboardName, setEditDashboardName] = useState("")
  const [editDashboardDescription, setEditDashboardDescription] = useState("")
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [projectComments, setProjectComments] = useState<Record<string, any[]>>({})
  const [metricsProjectId, setMetricsProjectId] = useState<string | null>(null)
  const [metricsForm, setMetricsForm] = useState<DashboardMetricsConfig | null>(null)

  // Load stats and member counts for each project (with concurrency limit to avoid 429 rate limiting)
  useEffect(() => {
    if (apiProjects.length === 0) {
      setStatsByProjectId({})
      setMemberCountByProjectId({})
      return
    }
    let cancelled = false
    const load = async () => {
      const stats: Record<string, ProjectStats> = {}
      const members: Record<string, number> = {}
      await runWithConcurrencyLimit(apiProjects, 1, async (project) => {
        if (cancelled) return
        try {
          const [s, m] = await Promise.all([
            projectsService.getProjectStats(project.id).catch(() => null),
            projectsService.getProjectMembers(project.id).then((list) => list.length).catch(() => 0),
          ])
          if (!cancelled) {
            if (s) stats[project.id] = s
            members[project.id] = typeof m === "number" ? m : 0
          }
        } catch {
          if (!cancelled) members[project.id] = 0
        }
      })
      if (!cancelled) {
        setStatsByProjectId(stats)
        setMemberCountByProjectId(members)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [apiProjects])

  // Statistics from tasks/columns (fallback when API stats missing or to reflect current task data)
  const clientStatsByProjectId = useMemo<Record<string, ClientProjectStats>>(() => {
    const out: Record<string, ClientProjectStats> = {}
    for (const project of apiProjects) {
      const tasks = getTasks(project.id)
      const columns = getColumns(project.id)
      const doneCol = columns.find((c) => c.title.toLowerCase().includes("done"))
      const todoCols = columns.filter((c) => /to\s*do|todo/.test(c.title.toLowerCase()))
      const progressCols = columns.filter((c) => c.title.toLowerCase().includes("progress"))
      const totalTasks = tasks.length
      const completedTasks = doneCol ? tasks.filter((t) => t.columnId === doneCol.id).length : 0
      const todoTasks = todoCols.length
        ? tasks.filter((t) => todoCols.some((c) => c.id === t.columnId)).length
        : Math.max(0, totalTasks - completedTasks)
      const inProgressTasks = progressCols.length
        ? tasks.filter((t) => progressCols.some((c) => c.id === t.columnId)).length
        : 0
      out[project.id] = {
        totalTasks,
        completedTasks,
        todoTasks,
        inProgressTasks,
      }
    }
    return out
  }, [apiProjects, getTasks, getColumns])

  // Map API projects + stats to dashboard display shape (API stats preferred, then client stats from tasks/columns)
  const projects = useMemo<DashboardProject[]>(() => {
    return apiProjects.map((project) =>
      mapProjectToDashboard(
        project,
        statsByProjectId[project.id] ?? null,
        memberCountByProjectId[project.id] ?? 0,
        clientStatsByProjectId[project.id] ?? null
      )
    )
  }, [apiProjects, statsByProjectId, memberCountByProjectId, clientStatsByProjectId])

  const handlePostComment = (projectId: string) => {
    const commentText = commentTexts[projectId]?.trim()
    if (!commentText) return

    const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "User"
    const newComment = {
      user: displayName,
      avatar: getAvatarUrl() ?? "/professional-avatar.png",
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

  const handleDuplicateDashboard = (projectId: string) => {
    router.push(`/projects?duplicate=${projectId}`)
  }

  const handleDeleteDashboard = async (projectId: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return
    try {
      await deleteProject(projectId)
    } catch {
      // Error already handled in context
    }
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

  const handleEditDashboard = async () => {
    if (!editingProject || !editDashboardName.trim()) return
    try {
      await updateProject(editingProject, {
        name: editDashboardName,
        description: editDashboardDescription,
      })
      setEditingProject(null)
      setEditDashboardName("")
      setEditDashboardDescription("")
    } catch {
      // Error handled in context
    }
  }

  const openEditDialog = (projectId: string) => {
    const project = projects.find((p: DashboardProject) => p.id === projectId)
    if (project) {
      setEditDashboardName(project.name)
      setEditDashboardDescription((project as any).description || `Dashboard for ${project.name}`)
      setEditingProject(projectId)
    }
  }

  const openMetricsDialog = (projectId: string) => {
    setMetricsProjectId(projectId)
    setMetricsForm(getDashboardMetrics(projectId))
  }

  const handleMetricToggle = (projectId: string, key: keyof DashboardMetricsConfig, checked: boolean) => {
    setDashboardMetrics(projectId, { [key]: checked })
    setMetricsForm((prev) => (prev ? { ...prev, [key]: checked } : null))
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
              <Button className="gap-2" onClick={() => router.push("/projects?new=1")}>
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {projectsLoading && apiProjects.length === 0 && (
          <div className="px-4 lg:px-8 pb-6 flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!projectsLoading && apiProjects.length === 0 && (
          <div className="px-4 lg:px-8 pb-6 flex items-center justify-center min-h-[280px]">
            <div className="text-center max-w-md">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Create a project from the Projects page to see dashboards and analytics here.
              </p>
              <Button onClick={() => router.push("/projects")}>
                <Plus className="h-4 w-4 mr-2" />
                Go to Projects
              </Button>
            </div>
          </div>
        )}

        {/* Overall Stats Grid — modern cards with concrete data */}
        {!projectsLoading && projects.length > 0 && (
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
                        <div
                          className={cn(
                            "h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0",
                            project.color?.startsWith("#") ? "" : project.color
                          )}
                          style={project.color?.startsWith("#") ? { backgroundColor: project.color } : undefined}
                        >
                          <FolderKanban className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">{project.name}</h3>
                            {project.statusLabel && (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px] font-medium shrink-0",
                                  project.status === "COMPLETED" && "bg-status-done/15 text-status-done border-status-done/30",
                                  project.status === "IN_PROGRESS" && "bg-accent/15 text-accent border-accent/30",
                                  project.status === "ON_HOLD" && "bg-muted text-muted-foreground",
                                  project.status === "PLANNING" && "bg-status-todo/15 text-status-todo border-status-todo/30"
                                )}
                              >
                                {project.statusLabel}
                              </Badge>
                            )}
                          </div>
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
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); openMetricsDialog(project.id); }}
                          title="Metrics settings"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass border-glass-border w-48">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openMetricsDialog(project.id); }}>
                              <Settings className="h-4 w-4 mr-2" />
                              Metrics
                            </DropdownMenuItem>
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
        )}
      </main>

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

      {/* Metrics settings dialog — show/hide metrics on project dashboard */}
      <Dialog open={metricsProjectId !== null} onOpenChange={(open) => !open && setMetricsProjectId(null)}>
        <DialogContent className="border-glass-border sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Show metrics
            </DialogTitle>
            <DialogDescription>
              Choose which metrics and charts to display on this project dashboard. Turn on or off any section.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
            {metricsProjectId && metricsForm && DASHBOARD_METRIC_IDS.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between gap-4 p-3 rounded-lg glass-subtle border border-border/50"
              >
                <span className="text-sm font-medium">{DASHBOARD_METRIC_LABELS[id]}</span>
                <Switch
                  checked={metricsForm[id]}
                  onCheckedChange={(checked) => handleMetricToggle(metricsProjectId, id, checked)}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMetricsProjectId(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ProtectedRoute>
  )
}

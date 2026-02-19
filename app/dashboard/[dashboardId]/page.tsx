"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useProjects } from "@/contexts/projects-context"
import { useTasks } from "@/contexts/tasks-context"
import { useColumns } from "@/contexts/columns-context"
import { projectsService } from "@/services/projects.service"
import type { Project, ProjectStats } from "@/lib/types"
import { getDashboardMetrics } from "@/lib/dashboard-metrics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  FolderKanban,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Heart,
  FileText,
  Calendar,
  AlertTriangle,
  Target,
  ListTodo,
  LayoutGrid,
} from "lucide-react"

const ProgressDoughnutChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => ({ default: m.ProgressDoughnutChart })),
  { ssr: false }
)
const TaskDistributionBarChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => ({ default: m.TaskDistributionBarChart })),
  { ssr: false }
)
const TimeDoughnutChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => ({ default: m.TimeDoughnutChart })),
  { ssr: false }
)
const VelocityBarChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => ({ default: m.VelocityBarChart })),
  { ssr: false }
)

const CHART_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

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

const PROJECT_STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  PLANNING: "Planning",
}

function mapProjectToDashboard(
  project: Project,
  stats: ProjectStats | null,
  memberCount: number
): Record<string, any> {
  const totalTasks = stats?.totalTasks ?? project.taskCount ?? 0
  const completedTasks = stats?.completedTasks ?? project.completedTasks ?? 0
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const color = project.color && project.color.startsWith("bg-") ? project.color : CHART_COLORS[0]
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    status: project.status,
    statusLabel: PROJECT_STATUS_LABELS[project.status] ?? project.status,
    startDate: project.startDate ?? null,
    endDate: project.endDate ?? null,
    createdAt: project.createdAt ?? null,
    updatedAt: project.updatedAt ?? null,
    color,
    completionRate,
    tasksCompleted: completedTasks,
    totalTasks,
    activeMembers: memberCount,
    trend: completionRate > 0 ? `+${completionRate}%` : "0%",
    trendUp: true,
    lastActivity: formatLastActivity(project.updatedAt),
    stats: {
      todo: stats?.todoTasks ?? Math.max(0, totalTasks - completedTasks),
      inProgress: stats?.inProgressTasks ?? 0,
      done: stats?.completedTasks ?? completedTasks,
      velocity: "—",
      timeSpent: "0",
      estimatedTime: "0",
      blockers: stats?.overdueTasks ?? 0,
    },
    recentComments: [],
  }
}

export default function DashboardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { getProject } = useProjects()
  const { getTasks, loadProjectTasks } = useTasks()
  const { getColumns, fetchColumns } = useColumns()
  const dashboardId = params.dashboardId as string
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [dashboard, setDashboard] = useState<Record<string, any> | null>(null)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set())
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [replies, setReplies] = useState<Record<number, Array<{ user: string; text: string; time: string }>>>({})

  const metricsConfig = getDashboardMetrics(dashboardId)

  // Load tasks and columns for this project so Task Distribution and Progress stay up to date
  useEffect(() => {
    if (!dashboardId) return
    loadProjectTasks(dashboardId)
    fetchColumns(dashboardId, false)
  }, [dashboardId, loadProjectTasks, fetchColumns])

  // Per-column task counts (all project columns for Task Distribution chart)
  const columnDistribution = useMemo(() => {
    if (!dashboardId) return []
    const tasks = getTasks(dashboardId)
    const columns = getColumns(dashboardId)
    return columns
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((col) => ({
        label: col.title,
        count: tasks.filter((t) => t.columnId === col.id).length,
        color: col.color,
      }))
  }, [dashboardId, getTasks, getColumns])

  // Live task distribution from current tasks/columns (updates when tasks move)
  const liveStats = useMemo(() => {
    if (!dashboardId) return null
    const tasks = getTasks(dashboardId)
    const columns = getColumns(dashboardId)
    const doneCol = columns.find((c) => c.title.toLowerCase().includes("done"))
    const todoCols = columns.filter((c) => /to\s*do|todo/.test(c.title.toLowerCase()))
    const progressCols = columns.filter((c) => c.title.toLowerCase().includes("progress"))
    const totalTasks = tasks.length
    const tasksCompleted = doneCol ? tasks.filter((t) => t.columnId === doneCol.id).length : 0
    const todo = todoCols.length
      ? tasks.filter((t) => todoCols.some((c) => c.id === t.columnId)).length
      : Math.max(0, totalTasks - tasksCompleted)
    const inProgress = progressCols.length
      ? tasks.filter((t) => progressCols.some((c) => c.id === t.columnId)).length
      : 0
    const done = tasksCompleted
    return { totalTasks, tasksCompleted, todo, inProgress, done, completionRate: totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0 }
  }, [dashboardId, getTasks, getColumns])

  // Use live stats for Task Distribution and Progress when available, else fall back to dashboard (API) stats
  const displayStats = useMemo(() => {
    if (!dashboard) return null
    const base = dashboard.stats ?? {}
    if (liveStats) {
      return {
        todo: liveStats.todo,
        inProgress: liveStats.inProgress,
        done: liveStats.done,
        totalTasks: liveStats.totalTasks,
        tasksCompleted: liveStats.tasksCompleted,
        completionRate: liveStats.completionRate,
        velocity: base.velocity ?? "—",
        timeSpent: base.timeSpent ?? "0",
        estimatedTime: base.estimatedTime ?? "0",
        blockers: base.blockers ?? 0,
      }
    }
    return {
      todo: base.todo ?? 0,
      inProgress: base.inProgress ?? 0,
      done: base.done ?? 0,
      totalTasks: dashboard.totalTasks ?? 0,
      tasksCompleted: dashboard.tasksCompleted ?? 0,
      completionRate: dashboard.completionRate ?? 0,
      velocity: base.velocity ?? "—",
      timeSpent: base.timeSpent ?? "0",
      estimatedTime: base.estimatedTime ?? "0",
      blockers: base.blockers ?? 0,
    }
  }, [dashboard, liveStats])

  // Tasks by priority (for Priority Distribution gadget)
  const priorityDistribution = useMemo(() => {
    if (!dashboardId) return { HIGH: 0, MEDIUM: 0, LOW: 0 }
    const tasks = getTasks(dashboardId)
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 }
    tasks.forEach((t) => {
      const p = t.priority ?? "MEDIUM"
      if (p in counts) counts[p as keyof typeof counts]++
    })
    return counts
  }, [dashboardId, getTasks])

  // Upcoming and overdue tasks (for gadgets)
  const { upcomingTasks, overdueTasks } = useMemo(() => {
    if (!dashboardId) return { upcomingTasks: [], overdueTasks: [] }
    const tasks = getTasks(dashboardId)
    const columns = getColumns(dashboardId)
    const doneCol = columns.find((c) => c.title.toLowerCase().includes("done"))
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const upcoming: typeof tasks = []
    const overdue: typeof tasks = []
    tasks.forEach((t) => {
      if (!t.dueDate) return
      const d = new Date(t.dueDate)
      d.setHours(0, 0, 0, 0)
      const isDone = doneCol && t.columnId === doneCol.id
      if (d < today && !isDone) overdue.push(t)
      else if (d >= today) upcoming.push(t)
    })
    upcoming.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    overdue.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    return { upcomingTasks: upcoming.slice(0, 10), overdueTasks: overdue.slice(0, 10) }
  }, [dashboardId, getTasks, getColumns])

  useEffect(() => {
    if (!dashboardId) return
    const fromContext = getProject(dashboardId)
    if (fromContext) {
      let cancelled = false
      Promise.all([
        projectsService.getProjectStats(dashboardId).catch(() => null),
        projectsService.getProjectMembers(dashboardId).then((list) => list.length).catch(() => 0),
      ]).then(([stats, memberCount]) => {
        if (cancelled) return
        const mapped = mapProjectToDashboard(
          fromContext,
          stats,
          typeof memberCount === "number" ? memberCount : 0
        )
        setDashboard(mapped)
        setComments(mapped.recentComments ?? [])
      })
      return () => {
        cancelled = true
      }
    }
    projectsService
      .getProject(dashboardId)
      .then((project) => {
        return Promise.all([
          Promise.resolve(project),
          projectsService.getProjectStats(dashboardId).catch(() => null),
          projectsService.getProjectMembers(dashboardId).then((list) => list.length).catch(() => 0),
        ])
      })
      .then(([project, stats, memberCount]) => {
        const mapped = mapProjectToDashboard(
          project,
          stats,
          typeof memberCount === "number" ? memberCount : 0
        )
        setDashboard(mapped)
        setComments(mapped.recentComments ?? [])
      })
      .catch(() => router.push("/dashboard"))
  }, [dashboardId, getProject, router])

  const handlePostComment = () => {
    const text = commentText.trim()
    if (!text) return

    const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "User"
    const newComment = {
      user: displayName,
      avatar: user?.avatar ?? "/professional-avatar.png",
      text: text,
      time: "Just now"
    }

    setComments([newComment, ...comments])
    setCommentText("")
    toast({ title: "Comment posted" })
  }

  const handleLike = (commentIdx: number) => {
    setLikedComments((prev) => {
      const next = new Set(prev)
      if (next.has(commentIdx)) next.delete(commentIdx)
      else next.add(commentIdx)
      return next
    })
  }

  const handleReplySubmit = (commentIdx: number) => {
    const text = replyText.trim()
    if (!text) return
    const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "User"
    const newReply = { user: displayName, text, time: "Just now" }
    setReplies((prev) => ({
      ...prev,
      [commentIdx]: [...(prev[commentIdx] || []), newReply],
    }))
    setReplyText("")
    setReplyingTo(null)
    toast({ title: "Reply posted" })
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen animated-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
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
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out w-full",
        "pl-0 lg:pl-64",
        sidebarCollapsed && "lg:pl-20"
      )}>
        {/* Header with Back Button */}
        <div className="px-4 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboards
          </Button>
          
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center", dashboard.color)}>
                  <FolderKanban className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{dashboard.name}</h1>
                    {dashboard.completionRate === 100 && (
                      <Badge className="bg-status-done/10 text-status-done border-status-done/30">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dashboard.description || `Dashboard for ${dashboard.name} project analytics`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 font-medium">
                  <FileText className="h-3 w-3" />
                  {dashboard.statusLabel ?? dashboard.status}
                </Badge>
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                  dashboard.trendUp ? "bg-status-done/10 text-status-done" : "bg-destructive/10 text-destructive"
                )}>
                  {dashboard.trendUp ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {dashboard.trend}
                </div>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {dashboard.lastActivity}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="px-4 lg:px-8 pb-6 space-y-6">
          {/* Project data */}
          {metricsConfig.projectInfo && (
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Project
              </CardTitle>
              <CardDescription>Project details and timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboard.description ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">{dashboard.description}</p>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <Badge variant="secondary">{dashboard.statusLabel ?? dashboard.status}</Badge>
                </div>
                {(dashboard.startDate || dashboard.endDate) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {dashboard.startDate
                        ? new Date(dashboard.startDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                      {" → "}
                      {dashboard.endDate
                        ? new Date(dashboard.endDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {dashboard.activeMembers} member{dashboard.activeMembers !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Tasks</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {dashboard.tasksCompleted} / {dashboard.totalTasks} completed
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Quick Summary */}
          {metricsConfig.summaryStats && displayStats && (
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                Quick Summary
              </CardTitle>
              <CardDescription>Key numbers at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg glass-subtle border border-border/50 text-center">
                  <div className="text-2xl font-bold text-foreground tabular-nums">{displayStats.totalTasks}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total tasks</div>
                </div>
                <div className="p-4 rounded-lg glass-subtle border border-border/50 text-center">
                  <div className="text-2xl font-bold text-status-done tabular-nums">{displayStats.tasksCompleted}</div>
                  <div className="text-xs text-muted-foreground mt-1">Completed</div>
                </div>
                <div className="p-4 rounded-lg glass-subtle border border-border/50 text-center">
                  <div className="text-2xl font-bold text-accent tabular-nums">{displayStats.inProgress}</div>
                  <div className="text-xs text-muted-foreground mt-1">In progress</div>
                </div>
                <div className="p-4 rounded-lg glass-subtle border border-border/50 text-center">
                  <div className="text-2xl font-bold text-primary tabular-nums">{displayStats.completionRate}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Completion</div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Overdue & Blockers */}
          {metricsConfig.overdueBlockers && displayStats && (
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Overdue & Blockers
              </CardTitle>
              <CardDescription>Items needing attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayStats.blockers > 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="h-12 w-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <span className="text-destructive text-xl font-bold">{displayStats.blockers}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-destructive">Active Blockers</div>
                    <div className="text-xs text-muted-foreground">These tasks need immediate attention</div>
                  </div>
                </div>
              ) : null}
              {overdueTasks.length > 0 ? (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Overdue tasks</div>
                  <ul className="space-y-2">
                    {overdueTasks.map((t) => (
                      <li key={t.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                        <span className="truncate flex-1">{t.title}</span>
                        <span className="text-destructive text-xs shrink-0 ml-2">
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {displayStats.blockers === 0 && overdueTasks.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No overdue tasks or blockers</p>
              )}
            </CardContent>
          </Card>
          )}

          {/* Progress Overview (Chart.js) — uses live task data when available */}
          {metricsConfig.progressOverview && displayStats && (
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Current status and completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-[200px] h-[200px] flex-shrink-0">
                  <ProgressDoughnutChart
                    completed={displayStats.tasksCompleted}
                    total={displayStats.totalTasks}
                    size={200}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-primary mb-1">{displayStats.completionRate}%</div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{displayStats.tasksCompleted}</span> completed ·{" "}
                    <span className="font-medium text-foreground">{displayStats.totalTasks - displayStats.tasksCompleted}</span> remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Task Distribution (Chart.js) — one bar per project column, live task data */}
          {metricsConfig.taskDistribution && displayStats && (
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
              <CardDescription>Tasks per column in this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {columnDistribution.length > 0 ? (
                  <TaskDistributionBarChart
                    columns={columnDistribution}
                    height={200}
                  />
                ) : (
                  <TaskDistributionBarChart
                    todo={displayStats.todo}
                    inProgress={displayStats.inProgress}
                    done={displayStats.done}
                    height={200}
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {columnDistribution.length > 0
                  ? columnDistribution.map((col) => (
                      <span key={col.label}>
                        {col.label}: <strong className="text-foreground tabular-nums">{col.count}</strong>
                      </span>
                    ))
                  : (
                    <>
                      <span>To Do: <strong className="text-status-todo">{displayStats.todo}</strong></span>
                      <span>In Progress: <strong className="text-accent">{displayStats.inProgress}</strong></span>
                      <span>Done: <strong className="text-status-done">{displayStats.done}</strong></span>
                    </>
                  )}
              </div>
              {displayStats.blockers > 0 && !metricsConfig.overdueBlockers && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 mt-4">
                  <div className="h-12 w-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <span className="text-destructive text-xl font-bold">{displayStats.blockers}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-destructive">Active Blockers</div>
                    <div className="text-xs text-muted-foreground">These tasks need immediate attention</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* Tasks by Priority */}
          {metricsConfig.priorityDistribution && (
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tasks by Priority
              </CardTitle>
              <CardDescription>Distribution of tasks by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                  <div className="text-2xl font-bold text-destructive tabular-nums">{priorityDistribution.HIGH}</div>
                  <div className="text-xs text-muted-foreground mt-1">High</div>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{priorityDistribution.MEDIUM}</div>
                  <div className="text-xs text-muted-foreground mt-1">Medium</div>
                </div>
                <div className="p-4 rounded-lg bg-muted border border-border text-center">
                  <div className="text-2xl font-bold text-muted-foreground tabular-nums">{priorityDistribution.LOW}</div>
                  <div className="text-xs text-muted-foreground mt-1">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Upcoming Deadlines */}
          {metricsConfig.upcomingDeadlines && (
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>Tasks with due dates (nearest first)</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingTasks.map((t) => (
                    <li key={t.id} className="flex items-center justify-between p-2 rounded-md glass-subtle border border-border/50 text-sm">
                      <span className="truncate flex-1">{t.title}</span>
                      <span className="text-muted-foreground text-xs shrink-0 ml-2">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          )}

          {/* Burndown (placeholder) */}
          {metricsConfig.burndown && (
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Burndown Chart
              </CardTitle>
              <CardDescription>Remaining work over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed border-border text-muted-foreground">
                <BarChart3 className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">Burndown chart</p>
                <p className="text-xs mt-1">Coming soon — track remaining tasks over time</p>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Performance Metrics (Chart.js) */}
          {displayStats && (metricsConfig.timeTracking || metricsConfig.velocity || metricsConfig.teamActivity) && (
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Time tracking and team velocity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Time Tracking (Chart.js Doughnut) */}
                {metricsConfig.timeTracking && (
                <div className="flex flex-col items-center p-4 glass-subtle rounded-lg">
                  <div className="w-[160px] h-[160px] mb-4">
                    <TimeDoughnutChart
                      spent={parseInt(displayStats.timeSpent) || 0}
                      estimated={Math.max(parseInt(displayStats.estimatedTime) || 1, 1)}
                      size={160}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Time Tracking</div>
                    <div className="text-lg font-bold">{displayStats.timeSpent} / {displayStats.estimatedTime}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((parseInt(displayStats.timeSpent) / Math.max(parseInt(displayStats.estimatedTime), 1)) * 100)}% used
                    </div>
                  </div>
                </div>
                )}

                {/* Velocity (Chart.js Bar) */}
                {metricsConfig.velocity && (
                <div className="flex flex-col items-center p-4 glass-subtle rounded-lg">
                  <div className="w-full h-[160px] mb-4">
                    <VelocityBarChart
                      labels={["W1", "W2", "W3", "W4"]}
                      values={[2, 3, 2, 4]}
                      height={160}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Velocity</div>
                    <div className="text-lg font-bold">{displayStats.velocity}</div>
                  </div>
                </div>
                )}

                {/* Team Activity */}
                {metricsConfig.teamActivity && (
                <div className="flex flex-col items-center p-4 glass-subtle rounded-lg">
                  <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 to-accent/30"></div>
                    <Users className="h-16 w-16 text-primary relative z-10" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Active Team</div>
                    <div className="text-lg font-bold">{dashboard.activeMembers} Members</div>
                  </div>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Comments Section */}
          {metricsConfig.activityComments && (
          <Card className="glass border-glass-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Activity & Comments
                  </CardTitle>
                  <CardDescription>Team updates and discussions</CardDescription>
                </div>
                <Badge variant="secondary">{comments.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment Form */}
              <div className="p-4 rounded-lg glass-subtle border border-border/50">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-background">
                    <AvatarImage src="/professional-avatar.png" />
                    <AvatarFallback className="bg-primary/20 text-primary">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder={`Share an update about ${dashboard.name}...`}
                      className="glass-subtle border-glass-border min-h-[100px]"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handlePostComment}
                        disabled={!commentText.trim()}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment, idx) => (
                  <div key={idx} className="group">
                    <div className="flex gap-3 p-4 rounded-lg glass-subtle hover:bg-secondary/50 transition-colors">
                      <Avatar className="h-10 w-10 ring-2 ring-background">
                        <AvatarImage src={comment.avatar} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {comment.user[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{comment.user}</span>
                          <Badge variant="outline" className="text-xs">Team Member</Badge>
                          <span className="text-sm text-muted-foreground ml-auto">{comment.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{comment.text}</p>
                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleLike(idx)}
                            className={cn(
                              "text-sm flex items-center gap-1 rounded-md px-2 py-1 transition-colors",
                              likedComments.has(idx)
                                ? "text-destructive hover:text-destructive/80"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {likedComments.has(idx) ? (
                              <Heart className="h-4 w-4 fill-current" />
                            ) : (
                              <Heart className="h-4 w-4" />
                            )}
                            Like{likedComments.has(idx) ? "d" : ""}
                          </button>
                          <button
                            type="button"
                            onClick={() => setReplyingTo(replyingTo === idx ? null : idx)}
                            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-2 py-1"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Reply
                          </button>
                        </div>
                        {replyingTo === idx && (
                          <div className="mt-3 flex gap-2">
                            <Textarea
                              placeholder={`Reply to ${comment.user}...`}
                              className="min-h-[60px] flex-1"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              autoFocus
                            />
                            <div className="flex flex-col gap-1">
                              <Button size="sm" onClick={() => handleReplySubmit(idx)} disabled={!replyText.trim()}>
                                Send
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                        {(replies[idx]?.length ?? 0) > 0 && (
                          <div className="mt-3 ml-4 space-y-2 border-l-2 border-border pl-4">
                            {replies[idx].map((r, ri) => (
                              <div key={ri} className="text-sm">
                                <span className="font-medium text-foreground">{r.user}</span>
                                <span className="text-muted-foreground ml-2 text-xs">{r.time}</span>
                                <p className="text-muted-foreground mt-0.5">{r.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </main>

    </div>
  )
}

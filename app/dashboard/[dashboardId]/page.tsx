"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  FolderKanban,
  MessageSquare,
  Activity,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Heart,
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

// Mock project data
const dashboardData: Record<string, any> = {
  "1": {
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
  "2": {
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
  "3": {
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
  "4": {
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
  "5": {
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
}

export default function DashboardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const dashboardId = params.dashboardId as string
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [dashboard, setDashboard] = useState<any>(null)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false)
  const [statusUpdateText, setStatusUpdateText] = useState("")
  const [logTimeOpen, setLogTimeOpen] = useState(false)
  const [logTimeHours, setLogTimeHours] = useState("")
  const [logTimeNote, setLogTimeNote] = useState("")
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set())
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [replies, setReplies] = useState<Record<number, Array<{ user: string; text: string; time: string }>>>({})

  useEffect(() => {
    const foundDashboard = dashboardData[dashboardId]
    if (foundDashboard) {
      setDashboard(foundDashboard)
      setComments(foundDashboard.recentComments)
    } else {
      router.push("/dashboard")
    }
  }, [dashboardId, router])

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

  const handleStatusUpdate = () => {
    const text = statusUpdateText.trim()
    if (!text) return
    const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "User"
    const newComment = {
      user: displayName,
      avatar: user?.avatar ?? "/professional-avatar.png",
      text: `[Status] ${text}`,
      time: "Just now"
    }
    setComments([newComment, ...comments])
    setStatusUpdateText("")
    setStatusUpdateOpen(false)
    toast({ title: "Status update posted" })
  }

  const handleLogTime = () => {
    const hours = logTimeHours.trim()
    if (!hours || isNaN(Number(hours)) || Number(hours) <= 0) {
      toast({ title: "Enter valid hours", variant: "destructive" })
      return
    }
    const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "User"
    const note = logTimeNote.trim()
    const newComment = {
      user: displayName,
      avatar: user?.avatar ?? "/professional-avatar.png",
      text: `[Time logged] ${hours}h${note ? ` — ${note}` : ""}`,
      time: "Just now"
    }
    setComments([newComment, ...comments])
    setLogTimeHours("")
    setLogTimeNote("")
    setLogTimeOpen(false)
    toast({ title: `${hours}h logged` })
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
                    Dashboard for {dashboard.name} project analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
          {/* Progress Overview (Chart.js) */}
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Current status and completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-[200px] h-[200px] flex-shrink-0">
                  <ProgressDoughnutChart
                    completed={dashboard.tasksCompleted}
                    total={dashboard.totalTasks}
                    size={200}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-primary mb-1">{dashboard.completionRate}%</div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{dashboard.tasksCompleted}</span> completed ·{" "}
                    <span className="font-medium text-foreground">{dashboard.totalTasks - dashboard.tasksCompleted}</span> remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Distribution (Chart.js) */}
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
              <CardDescription>Breakdown of tasks by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] mb-4">
                <TaskDistributionBarChart
                  todo={dashboard.stats.todo}
                  inProgress={dashboard.stats.inProgress}
                  done={dashboard.stats.done}
                  height={200}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>To Do: <strong className="text-status-todo">{dashboard.stats.todo}</strong></span>
                <span>In Progress: <strong className="text-accent">{dashboard.stats.inProgress}</strong></span>
                <span>Done: <strong className="text-status-done">{dashboard.stats.done}</strong></span>
              </div>
              {dashboard.stats.blockers > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 mt-4">
                  <div className="h-12 w-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <span className="text-destructive text-xl font-bold">{dashboard.stats.blockers}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-destructive">Active Blockers</div>
                    <div className="text-xs text-muted-foreground">These tasks need immediate attention</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics (Chart.js) */}
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Time tracking and team velocity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Time Tracking (Chart.js Doughnut) */}
                <div className="flex flex-col items-center p-4 glass-subtle rounded-lg">
                  <div className="w-[160px] h-[160px] mb-4">
                    <TimeDoughnutChart
                      spent={parseInt(dashboard.stats.timeSpent) || 0}
                      estimated={Math.max(parseInt(dashboard.stats.estimatedTime) || 1, 1)}
                      size={160}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Time Tracking</div>
                    <div className="text-lg font-bold">{dashboard.stats.timeSpent} / {dashboard.stats.estimatedTime}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((parseInt(dashboard.stats.timeSpent) / Math.max(parseInt(dashboard.stats.estimatedTime), 1)) * 100)}% used
                    </div>
                  </div>
                </div>

                {/* Velocity (Chart.js Bar) */}
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
                    <div className="text-lg font-bold">{dashboard.stats.velocity}</div>
                  </div>
                </div>

                {/* Team Activity */}
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
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setStatusUpdateOpen(true)}>
                          <Activity className="h-4 w-4 mr-2" />
                          Status Update
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setLogTimeOpen(true)}>
                          <Clock className="h-4 w-4 mr-2" />
                          Log Time
                        </Button>
                      </div>
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
        </div>
      </main>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="border-glass-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Status Update</DialogTitle>
            <DialogDescription>Share a quick status update for the team</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status-text">Update</Label>
              <Textarea
                id="status-text"
                placeholder="e.g. Completed API integration, starting frontend..."
                className="min-h-[100px]"
                value={statusUpdateText}
                onChange={(e) => setStatusUpdateText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStatusUpdateOpen(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={!statusUpdateText.trim()}>
              <Activity className="h-4 w-4 mr-2" />
              Post Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Time Dialog */}
      <Dialog open={logTimeOpen} onOpenChange={setLogTimeOpen}>
        <DialogContent className="border-glass-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log Time</DialogTitle>
            <DialogDescription>Log hours spent on this project</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="log-hours">Hours</Label>
              <Input
                id="log-hours"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="e.g. 2.5"
                value={logTimeHours}
                onChange={(e) => setLogTimeHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-note">Note (optional)</Label>
              <Input
                id="log-note"
                placeholder="e.g. API integration"
                value={logTimeNote}
                onChange={(e) => setLogTimeNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLogTimeOpen(false)}>Cancel</Button>
            <Button onClick={handleLogTime} disabled={!logTimeHours.trim()}>
              <Clock className="h-4 w-4 mr-2" />
              Log Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

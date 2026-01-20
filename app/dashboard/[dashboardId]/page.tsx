"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"
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
  Activity,
  ArrowUp,
  ArrowDown,
  ArrowLeft
} from "lucide-react"

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
  const dashboardId = params.dashboardId as string
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [dashboard, setDashboard] = useState<any>(null)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([])

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

    const newComment = {
      user: "John Doe",
      avatar: "/professional-avatar.png",
      text: text,
      time: "Just now"
    }

    setComments([newComment, ...comments])
    setCommentText("")
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
          {/* Progress Overview */}
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Current status and completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="text-2xl font-bold text-primary">{dashboard.completionRate}%</span>
                  </div>
                  <div className="h-4 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", dashboard.color)}
                      style={{ width: `${dashboard.completionRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <span>{dashboard.tasksCompleted} completed</span>
                    <span>{dashboard.totalTasks - dashboard.tasksCompleted} remaining</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Distribution */}
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
              <CardDescription>Breakdown of tasks by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* To Do */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">To Do</span>
                    <span className="font-bold text-status-todo">{dashboard.stats.todo} tasks</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-status-todo rounded-full transition-all"
                      style={{ width: `${(dashboard.stats.todo / dashboard.totalTasks) * 100}%` }}
                    />
                  </div>
                </div>
                {/* In Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-bold text-accent">{dashboard.stats.inProgress} tasks</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${(dashboard.stats.inProgress / dashboard.totalTasks) * 100}%` }}
                    />
                  </div>
                </div>
                {/* Done */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Done</span>
                    <span className="font-bold text-status-done">{dashboard.stats.done} tasks</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-status-done rounded-full transition-all"
                      style={{ width: `${(dashboard.stats.done / dashboard.totalTasks) * 100}%` }}
                    />
                  </div>
                </div>
                {/* Blockers */}
                {dashboard.stats.blockers > 0 && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="h-12 w-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                      <span className="text-destructive text-xl font-bold">{dashboard.stats.blockers}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-destructive">Active Blockers</div>
                      <div className="text-xs text-muted-foreground">These tasks need immediate attention</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Time tracking and team velocity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Time Progress Circle */}
                <div className="flex flex-col items-center p-4 glass-subtle rounded-lg">
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-secondary"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - parseInt(dashboard.stats.timeSpent) / parseInt(dashboard.stats.estimatedTime))}`}
                        className="text-primary transition-all"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">
                        {Math.round((parseInt(dashboard.stats.timeSpent) / parseInt(dashboard.stats.estimatedTime)) * 100)}%
                      </span>
                      <span className="text-xs text-muted-foreground">Used</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Time Tracking</div>
                    <div className="text-lg font-bold">{dashboard.stats.timeSpent} / {dashboard.stats.estimatedTime}</div>
                  </div>
                </div>

                {/* Velocity Chart */}
                <div className="flex flex-col items-center p-4 glass-subtle rounded-lg">
                  <div className="relative w-32 h-32 mb-4 flex items-end justify-center gap-2">
                    <div className="w-6 h-16 bg-primary/30 rounded-t"></div>
                    <div className="w-6 h-24 bg-primary/50 rounded-t"></div>
                    <div className="w-6 h-32 bg-primary rounded-t"></div>
                    <div className="w-6 h-20 bg-primary/70 rounded-t"></div>
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
                        <Button variant="ghost" size="sm">
                          <Activity className="h-4 w-4 mr-2" />
                          Status Update
                        </Button>
                        <Button variant="ghost" size="sm">
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
                          <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            Like
                          </button>
                          <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

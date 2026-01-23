"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  FolderKanban,
  MessageSquare,
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  Share2
} from "lucide-react"

// Mock project statistics
const projectStats = [
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [createDashboardOpen, setCreateDashboardOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [projectComments, setProjectComments] = useState<Record<string, any[]>>(
    projectStats.reduce((acc, project) => ({
      ...acc,
      [project.id]: project.recentComments
    }), {})
  )

  const handlePostComment = (projectId: string) => {
    const commentText = commentTexts[projectId]?.trim()
    if (!commentText) return

    const newComment = {
      user: "John Doe",
      avatar: "/professional-avatar.png",
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

  // Overall statistics
  const overallStats = [
    {
      title: "Total Projects",
      value: "5",
      icon: FolderKanban,
      trend: "+2 this month",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Active Tasks",
      value: "25",
      icon: Clock,
      trend: "+12 this week",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Completed Tasks",
      value: "25",
      icon: CheckCircle2,
      trend: "+15 this week",
      color: "text-status-done",
      bgColor: "bg-status-done/10",
    },
    {
      title: "Team Members",
      value: "4",
      icon: Users,
      trend: "Active now",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ]

  const totalTasks = projectStats.reduce((sum, p) => sum + p.totalTasks, 0)
  const completedTasks = projectStats.reduce((sum, p) => sum + p.tasksCompleted, 0)
  const overallCompletion = Math.round((completedTasks / totalTasks) * 100)

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

        {/* Overall Stats Grid */}
        <div className="px-4 lg:px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {overallStats.map((stat) => (
              <Card key={stat.title} className="glass border-glass-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bgColor)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-status-done" />
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overall Progress */}
          <Card className="glass border-glass-border mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overall Progress</CardTitle>
                  <CardDescription>Combined progress across all projects</CardDescription>
                </div>
                <div className="text-2xl font-bold text-primary">{overallCompletion}%</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                  style={{ width: `${overallCompletion}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>{completedTasks} completed</span>
                <span>{totalTasks - completedTasks} remaining</span>
              </div>
            </CardContent>
          </Card>

          {/* Project Dashboards */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 mb-4">
              <h2 className="text-xl font-bold">Project Dashboards</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3" />
                  Live Data
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Updated now
                </Badge>
              </div>
            </div>

            {/* Dashboards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectStats.map((project) => (
                  <Card 
                    key={project.id} 
                    className="glass border-glass-border hover:border-primary/50 transition-all group cursor-pointer"
                    onClick={() => router.push(`/dashboard/${project.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", project.color)}>
                            <FolderKanban className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{project.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              {project.completionRate === 100 && (
                                <Badge variant="outline" className="bg-status-done/10 text-status-done border-status-done/30 text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Done
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">{project.lastActivity}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass border-glass-border w-48">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingProject(project.id); }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Dashboard
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Download className="h-4 w-4 mr-2" />
                              Export Data
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => e.stopPropagation()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Dashboard
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-bold">{project.completionRate}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", project.color)}
                            style={{ width: `${project.completionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 rounded-lg glass-subtle">
                          <div className="text-xs text-muted-foreground">To Do</div>
                          <div className="text-lg font-bold text-status-todo">{project.stats.todo}</div>
                        </div>
                        <div className="text-center p-2 rounded-lg glass-subtle">
                          <div className="text-xs text-muted-foreground">Active</div>
                          <div className="text-lg font-bold text-accent">{project.stats.inProgress}</div>
                        </div>
                        <div className="text-center p-2 rounded-lg glass-subtle">
                          <div className="text-xs text-muted-foreground">Done</div>
                          <div className="text-lg font-bold text-status-done">{project.stats.done}</div>
                        </div>
                      </div>

                      {/* Team & Trend */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{project.activeMembers} members</span>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-medium",
                          project.trendUp ? "text-status-done" : "text-destructive"
                        )}>
                          {project.trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {project.trend}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dashboard-description">Description</Label>
              <Textarea
                id="dashboard-description"
                placeholder="Describe the purpose of this dashboard..."
                className="glass-subtle border-glass-border min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Select Projects</Label>
              <div className="space-y-2">
                {projectStats.map((project) => (
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
            <Button onClick={() => {
              // TODO: Implement dashboard creation
              setCreateDashboardOpen(false)
            }}>
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
            {editingProject && projectStats.find(p => p.id === editingProject) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-dashboard-name">Dashboard Name</Label>
                  <Input
                    id="edit-dashboard-name"
                    defaultValue={projectStats.find(p => p.id === editingProject)?.name}
                    className="glass-subtle border-glass-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dashboard-description">Description</Label>
                  <Textarea
                    id="edit-dashboard-description"
                    defaultValue={`Dashboard for ${projectStats.find(p => p.id === editingProject)?.name}`}
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
            <Button onClick={() => {
              // TODO: Implement dashboard update
              setEditingProject(null)
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

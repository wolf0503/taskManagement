"use client"

import { useState } from "react"
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
  MoreVertical
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [createDashboardOpen, setCreateDashboardOpen] = useState(false)

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
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between px-2">
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
            {projectStats.map((project) => (
              <Card key={project.id} className="glass border-glass-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", project.color)}>
                        <FolderKanban className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {project.name}
                          {project.completionRate === 100 && (
                            <Badge variant="outline" className="bg-status-done/10 text-status-done border-status-done/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          Last activity: {project.lastActivity}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium",
                        project.trendUp ? "bg-status-done/10 text-status-done" : "bg-destructive/10 text-destructive"
                      )}>
                        {project.trendUp ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {project.trend}
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold">{project.completionRate}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", project.color)}
                        style={{ width: `${project.completionRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{project.tasksCompleted} of {project.totalTasks} tasks</span>
                      <span>{project.activeMembers} active members</span>
                    </div>
                  </div>

                  {/* Visual Statistics - Task Distribution */}
                  <div className="glass-subtle rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-3">Task Distribution</h4>
                    <div className="space-y-3">
                      {/* To Do Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">To Do</span>
                          <span className="font-bold text-status-todo">{project.stats.todo} tasks</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-status-todo rounded-full transition-all"
                            style={{ width: `${(project.stats.todo / project.totalTasks) * 100}%` }}
                          />
                        </div>
                      </div>
                      {/* In Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">In Progress</span>
                          <span className="font-bold text-accent">{project.stats.inProgress} tasks</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{ width: `${(project.stats.inProgress / project.totalTasks) * 100}%` }}
                          />
                        </div>
                      </div>
                      {/* Done Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Done</span>
                          <span className="font-bold text-status-done">{project.stats.done} tasks</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-status-done rounded-full transition-all"
                            style={{ width: `${(project.stats.done / project.totalTasks) * 100}%` }}
                          />
                        </div>
                      </div>
                      {/* Blockers */}
                      {project.stats.blockers > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                          <div className="h-8 w-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                            <span className="text-destructive font-bold">{project.stats.blockers}</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-destructive">Active Blockers</div>
                            <div className="text-xs text-muted-foreground">Requires attention</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time & Performance Metrics */}
                  <div className="glass-subtle rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-3">Performance Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Time Progress Circle */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-20 h-20 mb-2">
                          <svg className="transform -rotate-90 w-20 h-20">
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              className="text-secondary"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 36}`}
                              strokeDashoffset={`${2 * Math.PI * 36 * (1 - parseInt(project.stats.timeSpent) / parseInt(project.stats.estimatedTime))}`}
                              className="text-primary transition-all"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold">
                              {Math.round((parseInt(project.stats.timeSpent) / parseInt(project.stats.estimatedTime)) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Time Used</div>
                          <div className="text-sm font-bold">{project.stats.timeSpent} / {project.stats.estimatedTime}</div>
                        </div>
                      </div>

                      {/* Velocity Chart */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-20 h-20 mb-2 flex items-end justify-center gap-1">
                          <div className="w-3 h-12 bg-primary/30 rounded-t"></div>
                          <div className="w-3 h-16 bg-primary/50 rounded-t"></div>
                          <div className="w-3 h-20 bg-primary rounded-t"></div>
                          <div className="w-3 h-14 bg-primary/70 rounded-t"></div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Velocity</div>
                          <div className="text-sm font-bold">{project.stats.velocity}</div>
                        </div>
                      </div>

                      {/* Team Activity */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20"></div>
                          <Users className="h-8 w-8 text-primary relative z-10" />
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Team Members</div>
                          <div className="text-sm font-bold">{project.activeMembers} Active</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm font-semibold">Project Activity & Comments</h4>
                      <Badge variant="secondary" className="ml-auto">{project.recentComments.length}</Badge>
                    </div>

                    {/* Add Comment Form */}
                    <div className="mb-4 p-4 rounded-lg glass-subtle border border-border/50">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 ring-2 ring-background">
                          <AvatarImage src="/professional-avatar.png" />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            JD
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder={`Add a comment about ${project.name}...`}
                            className="glass-subtle border-glass-border min-h-[80px] text-sm"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                <Activity className="h-3 w-3 mr-1" />
                                Status Update
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Time Log
                              </Button>
                            </div>
                            <Button size="sm" className="h-8">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Post Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {project.recentComments.map((comment, idx) => (
                        <div key={idx} className="group">
                          <div className="flex gap-3 p-3 rounded-lg glass-subtle hover:bg-secondary/50 transition-colors">
                            <Avatar className="h-8 w-8 ring-2 ring-background">
                              <AvatarImage src={comment.avatar} />
                              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                {comment.user[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{comment.user}</span>
                                <Badge variant="outline" className="text-xs">
                                  Team Member
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-auto">{comment.time}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{comment.text}</p>
                              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Like
                                </button>
                                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* View All Comments */}
                    <Button variant="ghost" size="sm" className="w-full mt-3">
                      View All Comments ({project.recentComments.length + 3} total)
                      <ArrowDown className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Create Dashboard Dialog */}
      <Dialog open={createDashboardOpen} onOpenChange={setCreateDashboardOpen}>
        <DialogContent className="glass border-glass-border sm:max-w-[500px]">
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
    </div>
  )
}

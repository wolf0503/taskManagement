"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle2,
  LayoutDashboard,
  FolderKanban,
  Users,
  Calendar,
  Settings,
  LogOut,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  // Redirect to sign-in if not authenticated (after loading)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in")
    }
  }, [isLoading, isAuthenticated, router])

  const userName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : ""
  const userEmail = user?.email ?? ""

  const handleSignOut = async () => {
    await logout()
  }

  // Show loading while checking auth or redirecting
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: LayoutDashboard,
      title: "Analytics Dashboard",
      description: "Track project progress with real-time statistics and insights",
      color: "bg-chart-1",
      href: "/dashboard",
    },
    {
      icon: FolderKanban,
      title: "Project Management",
      description: "Organize tasks with intuitive Kanban boards and workflows",
      color: "bg-chart-2",
      href: "/projects",
    },
    {
      icon: Calendar,
      title: "Smart Calendar",
      description: "Schedule meetings and track deadlines effortlessly",
      color: "bg-chart-3",
      href: "/calendar",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Connect with team members and manage roles efficiently",
      color: "bg-chart-4",
      href: "/teams",
    },
  ]

  const stats = [
    { value: "50+", label: "Active Projects" },
    { value: "200+", label: "Tasks Completed" },
    { value: "30+", label: "Team Members" },
    { value: "98%", label: "On-Time Delivery" },
  ]

  return (
    <div className="min-h-screen animated-gradient-bg">
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

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-glass-border glass backdrop-blur-xl">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Logo/Name */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TaskFlow
                </h1>
                <p className="text-xs text-muted-foreground">Project Management</p>
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center gap-3">
                <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/settings")}
                className="hidden sm:inline-flex"
                title="Application settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/account")}
                className="hidden sm:inline-flex"
                title="Account settings"
              >
                <User className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative gap-2 pl-2 pr-3">
                    <Avatar className="h-8 w-8 ring-2 ring-background">
                      <AvatarImage src={user?.avatar ?? undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {userName
                          ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                          : (user?.email?.[0] ?? "?").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-glass-border">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Application settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/account")}>
                    <User className="mr-2 h-4 w-4" />
                    Account settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}! 👋
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Manage Your Projects
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              With Confidence
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Streamline your workflow, collaborate with your team, and achieve your goals faster
            with our powerful project management platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/projects")}
            >
              View Projects
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-6 text-center border-glass-border hover:border-primary/50 transition-all"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Everything You Need</h3>
            <p className="text-muted-foreground">
              Powerful features to help you manage projects efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                onClick={() => router.push(feature.href)}
                className="glass rounded-2xl p-6 border-glass-border hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center mb-4",
                    feature.color
                  )}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-8 border-glass-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">
                Jump into your most common tasks
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2"
              onClick={() => router.push("/projects")}
            >
              <FolderKanban className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Create Project</div>
                <div className="text-xs text-muted-foreground">Start a new project</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2"
              onClick={() => router.push("/calendar")}
            >
              <Calendar className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Schedule Meeting</div>
                <div className="text-xs text-muted-foreground">Plan team sync</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2"
              onClick={() => router.push("/teams")}
            >
              <Users className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Invite Team</div>
                <div className="text-xs text-muted-foreground">Add new members</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2"
              onClick={() => router.push("/dashboard")}
            >
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">View Progress</div>
                <div className="text-xs text-muted-foreground">Check analytics</div>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

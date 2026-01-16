"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { TaskBoard } from "@/components/task-board"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/types"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock project data - in a real app, this would come from an API
const mockProjects: Record<string, Project> = {
  "1": {
    id: "1",
    name: "Website Redesign",
    description: "Redesigning the main website with modern UI/UX principles",
    status: "in-progress",
    color: "bg-chart-1",
    teamMembers: [
      { name: "Alice", avatar: "/professional-woman.png" },
      { name: "Bob", avatar: "/professional-man.png" },
      { name: "Carol", avatar: "/woman-developer.png" },
      { name: "David", avatar: "/man-designer.png" },
    ],
    taskCount: 8,
    completedTasks: 2,
  },
  "2": {
    id: "2",
    name: "Mobile App",
    description: "Building a cross-platform mobile application",
    status: "in-progress",
    color: "bg-chart-2",
    teamMembers: [
      { name: "Alice", avatar: "/professional-woman.png" },
      { name: "Bob", avatar: "/professional-man.png" },
    ],
    taskCount: 12,
    completedTasks: 5,
  },
  "3": {
    id: "3",
    name: "Marketing Campaign",
    description: "Q1 marketing campaign planning and execution",
    status: "planning",
    color: "bg-chart-3",
    teamMembers: [
      { name: "Carol", avatar: "/woman-developer.png" },
    ],
    taskCount: 6,
    completedTasks: 0,
  },
  "4": {
    id: "4",
    name: "API Development",
    description: "RESTful API development and documentation",
    status: "completed",
    color: "bg-chart-4",
    teamMembers: [
      { name: "David", avatar: "/man-designer.png" },
      { name: "Alice", avatar: "/professional-woman.png" },
    ],
    taskCount: 15,
    completedTasks: 15,
  },
  "5": {
    id: "5",
    name: "Database Migration",
    description: "Migrating to a new database system",
    status: "on-hold",
    color: "bg-chart-5",
    teamMembers: [
      { name: "Bob", avatar: "/professional-man.png" },
      { name: "Carol", avatar: "/woman-developer.png" },
    ],
    taskCount: 10,
    completedTasks: 3,
  },
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    // In a real app, fetch project data from API
    const foundProject = mockProjects[projectId]
    if (foundProject) {
      setProject(foundProject)
    } else {
      // Project not found, redirect to dashboard
      router.push("/dashboard")
    }
  }, [projectId, router])

  if (!project) {
    return (
      <div className="min-h-screen animated-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
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
        {/* Back Button */}
        <div className="px-4 lg:px-8 pt-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="gap-2 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </div>

        <Header project={project} />
        <TaskBoard />
      </main>
    </div>
  )
}

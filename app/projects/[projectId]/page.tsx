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
import { useProjects } from "@/contexts/projects-context"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { getProject } = useProjects()
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    // Get project from context
    const foundProject = getProject(projectId)
    if (foundProject) {
      setProject(foundProject)
    } else {
      // Project not found, redirect to projects
      router.push("/projects")
    }
  }, [projectId, router, getProject])

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
            onClick={() => router.push("/projects")}
            className="gap-2 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </div>

        <Header project={project} projectId={projectId} />
        <TaskBoard projectId={projectId} />
      </main>
    </div>
  )
}

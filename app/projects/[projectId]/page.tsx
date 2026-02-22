"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { TaskBoard } from "@/components/task-board"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AddProjectMembersDialog } from "@/components/add-project-members-dialog"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { cn } from "@/lib/utils"
import type { Project, ProjectMember } from "@/lib/types"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjects } from "@/contexts/projects-context"
import { useColumns } from "@/contexts/columns-context"
import { useTasks } from "@/contexts/tasks-context"
import { projectsService } from "@/services/projects.service"
import { usersService } from "@/services/users.service"

function mapMembersToTeamMembers(members: ProjectMember[]): { id: string; name: string; avatar: string }[] {
  return members.map((m) => {
    const u = m.user
    const name = u
      ? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || m.userId
      : m.userId
    return { id: m.userId, name, avatar: u?.avatar ?? "/placeholder.svg" }
  })
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [addMembersOpen, setAddMembersOpen] = useState(false)
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const { getProject, isLoading: projectsLoading } = useProjects()
  const { fetchColumns } = useColumns()
  const { loadProjectTasks } = useTasks()
  const [project, setProject] = useState<Project | null>(null)
  const [fetchingProject, setFetchingProject] = useState(false)

  const teamMembers = useMemo(() => mapMembersToTeamMembers(members), [members])
  const projectWithMembers = useMemo(
    () => (project ? { ...project, teamMembers } : null),
    [project, teamMembers]
  )

  // Load project, then members, then columns+tasks (sequential to avoid 429 burst)
  useEffect(() => {
    if (!projectId) return
    let cancelled = false

    const run = async () => {
      const fromContext = getProject(projectId)
      if (fromContext) {
        if (!cancelled) {
          setProject(fromContext)
          setFetchingProject(false)
        }
        let m = await projectsService.getProjectMembers(projectId).catch(() => [])
        if (fromContext.ownerId && !m.some((x) => x.userId === fromContext.ownerId)) {
          const users = await usersService.getUsers().catch(() => [])
          const ownerUser = users.find((u) => u.id === fromContext.ownerId)
          if (ownerUser) {
            m = [{
              id: fromContext.ownerId,
              userId: fromContext.ownerId,
              projectId: projectId,
              role: "OWNER",
              joinedAt: new Date().toISOString(),
              user: {
                id: ownerUser.id,
                email: ownerUser.email ?? "",
                firstName: ownerUser.firstName ?? "",
                lastName: ownerUser.lastName ?? "",
                avatar: ownerUser.avatar ?? null,
                status: ownerUser.status,
              },
            }, ...m]
          }
        }
        if (!cancelled) setMembers(m)
        if (cancelled) return
        fetchColumns(projectId, false)
        loadProjectTasks(projectId)
        return
      }
      if (projectsLoading) return
      setFetchingProject(true)
      try {
        const p = await projectsService.getProject(projectId)
        if (cancelled) return
        setProject(p)
        let m = await projectsService.getProjectMembers(projectId).catch(() => [])
        if (p.ownerId && !m.some((x) => x.userId === p.ownerId)) {
          const users = await usersService.getUsers().catch(() => [])
          const ownerUser = users.find((u) => u.id === p.ownerId)
          if (ownerUser) {
            m = [{
              id: p.ownerId,
              userId: p.ownerId,
              projectId: projectId,
              role: "OWNER",
              joinedAt: new Date().toISOString(),
              user: {
                id: ownerUser.id,
                email: ownerUser.email ?? "",
                firstName: ownerUser.firstName ?? "",
                lastName: ownerUser.lastName ?? "",
                avatar: ownerUser.avatar ?? null,
                status: ownerUser.status,
              },
            }, ...m]
          }
        }
        if (!cancelled) setMembers(m)
        if (cancelled) return
        fetchColumns(projectId, false)
        loadProjectTasks(projectId)
      } catch {
        if (!cancelled) router.push("/projects")
      } finally {
        if (!cancelled) setFetchingProject(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [projectId, getProject, projectsLoading, router, fetchColumns, loadProjectTasks])

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

        <Header
          project={projectWithMembers ?? project}
          projectId={projectId}
          projectMembers={members}
          onAddMembersClick={() => setAddMembersOpen(true)}
          onEditClick={() => setEditProjectOpen(true)}
        />
        <TaskBoard projectId={projectId} />
      </main>

      <AddProjectMembersDialog
        projectId={projectId}
        open={addMembersOpen}
        onOpenChange={setAddMembersOpen}
        onMembersChange={setMembers}
      />
      <EditProjectDialog
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={project}
        onSuccess={() => { const updated = getProject(projectId); if (updated) setProject(updated); }}
      />
    </div>
  )
}

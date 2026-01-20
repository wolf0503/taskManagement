"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  Plus,
  Search,
  Bell,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: false, href: "/dashboard" },
  { icon: FolderKanban, label: "Projects", active: false, href: "/projects" },
  { icon: Calendar, label: "Calendar", active: false, href: null },
  { icon: Users, label: "Team", active: false, href: null },
  { icon: Settings, label: "Settings", active: false, href: null },
]

const projects = [
  { name: "Website Redesign", color: "bg-chart-1" },
  { name: "Mobile App", color: "bg-chart-2" },
  { name: "Marketing", color: "bg-chart-3" },
]

interface SidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ collapsed: collapsedProp, onCollapsedChange }: SidebarProps = {}) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  const collapsed = collapsedProp !== undefined ? collapsedProp : internalCollapsed
  const setCollapsed = (value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(collapsed) : value
    if (onCollapsedChange) {
      onCollapsedChange(newValue)
    } else {
      setInternalCollapsed(newValue)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden glass"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <LayoutDashboard className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen glass z-50 transition-all duration-300 ease-out flex flex-col",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className={cn("p-6 flex items-center transition-all duration-300", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">FlowBoard</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex shrink-0 hover:bg-secondary"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Search */}
        <div className={cn("px-4 mb-4 transition-opacity", collapsed && "opacity-0")}>
          <div className="glass-subtle rounded-xl flex items-center gap-2 px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href ? pathname?.startsWith(item.href) : item.active
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.href) {
                    router.push(item.href)
                    setMobileOpen(false)
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  item.href && "cursor-pointer",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className={cn("text-sm font-medium transition-opacity", collapsed && "opacity-0")}>
                  {item.label}
                </span>
                {isActive && !collapsed && <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />}
              </button>
            )
          })}
        </nav>

        {/* Projects */}
        <div className={cn("px-4 py-4 transition-opacity", collapsed && "opacity-0")}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-secondary">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.name}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <div className={cn("h-2.5 w-2.5 rounded-full", project.color)} />
                <span className="truncate">{project.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User */}
        <div className={cn("p-4 border-t border-border/50", collapsed && "flex justify-center")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className="h-10 w-10 ring-2 ring-primary/30">
              <AvatarImage src="/professional-avatar.png" />
              <AvatarFallback className="bg-primary/20 text-primary">JD</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">john@flowboard.io</p>
              </div>
            )}
            {!collapsed && (
              <Button variant="ghost" size="icon" className="shrink-0 hover:bg-secondary relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

/**
 * Dashboard metrics visibility — per-project toggles for which charts/sections to show.
 * Stored in localStorage: dashboard-metrics-{projectId}
 */

export const DASHBOARD_METRIC_IDS = [
  "progressOverview",
  "taskDistribution",
  "timeTracking",
  "velocity",
  "teamActivity",
  "activityComments",
  "summaryStats",
  "overdueBlockers",
  "priorityDistribution",
  "upcomingDeadlines",
  "projectInfo",
  "burndown",
] as const

export type DashboardMetricId = (typeof DASHBOARD_METRIC_IDS)[number]

export const DASHBOARD_METRIC_LABELS: Record<DashboardMetricId, string> = {
  progressOverview: "Progress Overview",
  taskDistribution: "Task Distribution",
  timeTracking: "Time Tracking",
  velocity: "Velocity",
  teamActivity: "Team Activity",
  activityComments: "Activity & Comments",
  summaryStats: "Quick Summary",
  overdueBlockers: "Overdue & Blockers",
  priorityDistribution: "Tasks by Priority",
  upcomingDeadlines: "Upcoming Deadlines",
  projectInfo: "Project Details",
  burndown: "Burndown Chart",
}

export interface DashboardMetricsConfig {
  progressOverview: boolean
  taskDistribution: boolean
  timeTracking: boolean
  velocity: boolean
  teamActivity: boolean
  activityComments: boolean
  summaryStats: boolean
  overdueBlockers: boolean
  priorityDistribution: boolean
  upcomingDeadlines: boolean
  projectInfo: boolean
  burndown: boolean
}

const DEFAULT_METRICS: DashboardMetricsConfig = {
  progressOverview: true,
  taskDistribution: true,
  timeTracking: true,
  velocity: true,
  teamActivity: true,
  activityComments: true,
  summaryStats: true,
  overdueBlockers: true,
  priorityDistribution: true,
  upcomingDeadlines: true,
  projectInfo: true,
  burndown: false,
}

const STORAGE_PREFIX = "dashboard-metrics-"

function storageKey(projectId: string): string {
  return `${STORAGE_PREFIX}${projectId}`
}

export function getDashboardMetrics(projectId: string): DashboardMetricsConfig {
  if (typeof window === "undefined") return { ...DEFAULT_METRICS }
  try {
    const raw = localStorage.getItem(storageKey(projectId))
    if (!raw) return { ...DEFAULT_METRICS }
    const parsed = JSON.parse(raw) as Partial<DashboardMetricsConfig>
    return {
      ...DEFAULT_METRICS,
      ...parsed,
    }
  } catch {
    return { ...DEFAULT_METRICS }
  }
}

export function setDashboardMetrics(
  projectId: string,
  config: Partial<DashboardMetricsConfig>
): void {
  if (typeof window === "undefined") return
  try {
    const current = getDashboardMetrics(projectId)
    const next = { ...current, ...config }
    localStorage.setItem(storageKey(projectId), JSON.stringify(next))
  } catch {
    // ignore
  }
}

export function isMetricEnabled(projectId: string, metric: DashboardMetricId): boolean {
  return getDashboardMetrics(projectId)[metric]
}

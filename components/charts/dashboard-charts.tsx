"use client"

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Doughnut, Bar } from "react-chartjs-2"

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
)

const defaultColors = {
  primary: "rgba(59, 130, 246, 0.9)",
  accent: "rgba(34, 211, 238, 0.9)",
  done: "rgba(34, 197, 94, 0.9)",
  todo: "rgba(99, 102, 241, 0.9)",
  inProgress: "rgba(251, 191, 36, 0.9)",
  muted: "rgba(107, 114, 128, 0.5)",
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const },
  },
}

/** Progress: completed vs remaining (doughnut) */
export function ProgressDoughnutChart({
  completed,
  total,
  size = 200,
}: {
  completed: number
  total: number
  size?: number
}) {
  const remaining = Math.max(0, total - completed)
  const data = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: total > 0 ? [completed, remaining] : [0, 1],
        backgroundColor: [defaultColors.done, defaultColors.muted],
        borderWidth: 0,
      },
    ],
  }
  return (
    <div style={{ height: size }}>
      <Doughnut
        data={data}
        options={{
          ...chartOptions,
          cutout: "70%",
          plugins: {
            ...chartOptions.plugins,
            legend: { display: false },
            tooltip: { enabled: true },
          },
        }}
      />
    </div>
  )
}

const columnColorPalette = [
  defaultColors.todo,
  defaultColors.inProgress,
  defaultColors.done,
  defaultColors.primary,
  defaultColors.accent,
  defaultColors.muted,
]

/** Convert hex to rgba string for Chart.js if needed */
function hexToRgba(hex: string, alpha = 0.9): string {
  if (!hex || !hex.startsWith("#")) return columnColorPalette[0]
  const n = hex.slice(1)
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** Task distribution: by project columns (labels + counts) or fallback To Do / In Progress / Done */
export function TaskDistributionBarChart({
  todo,
  inProgress,
  done,
  columns: columnsProp,
  height = 200,
}: {
  todo?: number
  inProgress?: number
  done?: number
  /** When set, chart shows one bar per project column instead of todo/inProgress/done */
  columns?: { label: string; count: number; color?: string }[]
  height?: number
}) {
  const useColumns = columnsProp && columnsProp.length > 0
  const labels = useColumns
    ? columnsProp.map((c) => c.label)
    : ["To Do", "In Progress", "Done"]
  const values = useColumns
    ? columnsProp.map((c) => c.count)
    : [todo ?? 0, inProgress ?? 0, done ?? 0]
  const backgroundColors = useColumns
    ? columnsProp.map((c, i) => (c.color ? hexToRgba(c.color) : columnColorPalette[i % columnColorPalette.length]))
    : [defaultColors.todo, defaultColors.inProgress, defaultColors.done]
  const chartHeight = useColumns ? Math.max(height, 40 + columnsProp.length * 40) : height

  const data = {
    labels,
    datasets: [
      {
        label: "Tasks",
        data: values,
        backgroundColor: backgroundColors,
        borderRadius: 8,
      },
    ],
  }
  return (
    <div style={{ height: chartHeight }}>
      <Bar
        data={data}
        options={{
          ...chartOptions,
          indexAxis: "y" as const,
          scales: {
            x: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.06)" } },
            y: { grid: { display: false } },
          },
          plugins: {
            ...chartOptions.plugins,
            legend: { display: false },
          },
        }}
      />
    </div>
  )
}

/** Time spent vs estimated (doughnut) */
export function TimeDoughnutChart({
  spent,
  estimated,
  size = 200,
}: {
  spent: number
  estimated: number
  size?: number
}) {
  const remaining = Math.max(0, estimated - spent)
  const data = {
    labels: ["Spent", "Remaining"],
    datasets: [
      {
        data: estimated > 0 ? [spent, remaining] : [0, 1],
        backgroundColor: [defaultColors.primary, defaultColors.muted],
        borderWidth: 0,
      },
    ],
  }
  return (
    <div style={{ height: size }}>
      <Doughnut
        data={data}
        options={{
          ...chartOptions,
          cutout: "70%",
          plugins: {
            ...chartOptions.plugins,
            legend: { display: false },
            tooltip: { enabled: true },
          },
        }}
      />
    </div>
  )
}

/** Velocity per week (bar) – labels and values */
export function VelocityBarChart({
  labels,
  values,
  height = 200,
}: {
  labels: string[]
  values: number[]
  height?: number
}) {
  const data = {
    labels: labels.length ? labels : ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Tasks",
        data: values.length ? values : [2, 3, 2, 4],
        backgroundColor: defaultColors.primary,
        borderRadius: 8,
      },
    ],
  }
  return (
    <div style={{ height }}>
      <Bar
        data={data}
        options={{
          ...chartOptions,
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.06)" } },
          },
          plugins: {
            ...chartOptions.plugins,
            legend: { display: false },
          },
        }}
      />
    </div>
  )
}

/** Progress by project (bar) – for dashboard list */
export function ProjectsProgressBarChart({
  projectNames,
  completionRates,
  height = 220,
}: {
  projectNames: string[]
  completionRates: number[]
  height?: number
}) {
  const colors = [
    defaultColors.primary,
    defaultColors.accent,
    defaultColors.done,
    defaultColors.todo,
    defaultColors.inProgress,
  ]
  const data = {
    labels: projectNames,
    datasets: [
      {
        label: "Completion %",
        data: completionRates,
        backgroundColor: projectNames.map((_, i) => colors[i % colors.length]),
        borderRadius: 8,
      },
    ],
  }
  return (
    <div style={{ height }}>
      <Bar
        data={data}
        options={{
          ...chartOptions,
          scales: {
            x: { grid: { display: false } },
            y: {
              beginAtZero: true,
              max: 100,
              grid: { color: "rgba(255,255,255,0.06)" },
            },
          },
          plugins: {
            ...chartOptions.plugins,
            legend: { display: false },
          },
        }}
      />
    </div>
  )
}

/** Time logged by project (grouped bar: Logged vs Estimated hours) */
export function TimeLoggedByProjectChart({
  projectNames,
  loggedHours,
  estimatedHours,
  height = 260,
}: {
  projectNames: string[]
  loggedHours: number[]
  estimatedHours: number[]
  height?: number
}) {
  const data = {
    labels: projectNames,
    datasets: [
      {
        label: "Logged (h)",
        data: loggedHours,
        backgroundColor: defaultColors.primary,
        borderRadius: 6,
      },
      {
        label: "Estimated (h)",
        data: estimatedHours,
        backgroundColor: defaultColors.muted,
        borderRadius: 6,
      },
    ],
  }
  return (
    <div style={{ height }}>
      <Bar
        data={data}
        options={{
          ...chartOptions,
          scales: {
            x: { grid: { display: false } },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(255,255,255,0.06)" },
              ticks: { callback: (v) => (typeof v === "number" ? `${v}h` : v) },
            },
          },
          plugins: {
            ...chartOptions.plugins,
            legend: { position: "top" as const },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}h`,
              },
            },
          },
        }}
      />
    </div>
  )
}

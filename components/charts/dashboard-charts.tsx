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

/** Task distribution by status: To Do, In Progress, Done (bar) */
export function TaskDistributionBarChart({
  todo,
  inProgress,
  done,
  height = 200,
}: {
  todo: number
  inProgress: number
  done: number
  height?: number
}) {
  const data = {
    labels: ["To Do", "In Progress", "Done"],
    datasets: [
      {
        label: "Tasks",
        data: [todo, inProgress, done],
        backgroundColor: [
          defaultColors.todo,
          defaultColors.inProgress,
          defaultColors.done,
        ],
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

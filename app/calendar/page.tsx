"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  MapPin,
  Video,
  ListTodo,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Event type definition
interface CalendarEvent {
  id: string
  title: string
  type: string
  date: string
  time: string
  duration: string
  attendees: string[]
  location: string
  color: string
  project: string
}

// Mock calendar events - initial data
const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    type: "meeting",
    date: "2024-01-22",
    time: "09:00 AM",
    duration: "30 min",
    attendees: ["Sarah Johnson", "Michael Chen", "Alex Kumar"],
    location: "Zoom",
    color: "bg-chart-1",
    project: "Website Redesign",
  },
  {
    id: "2",
    title: "Design Review",
    type: "meeting",
    date: "2024-01-22",
    time: "02:00 PM",
    duration: "1 hour",
    attendees: ["Emily Rodriguez", "Sarah Johnson"],
    location: "Conference Room A",
    color: "bg-chart-2",
    project: "Mobile App",
  },
  {
    id: "3",
    title: "Submit Q1 Report",
    type: "deadline",
    date: "2024-01-22",
    time: "05:00 PM",
    duration: "",
    attendees: [],
    location: "",
    color: "bg-destructive",
    project: "Marketing",
  },
  {
    id: "4",
    title: "Code Review Session",
    type: "meeting",
    date: "2024-01-23",
    time: "11:00 AM",
    duration: "45 min",
    attendees: ["Michael Chen", "David Park", "Alex Kumar"],
    location: "Google Meet",
    color: "bg-chart-3",
    project: "API Integration",
  },
  {
    id: "5",
    title: "Client Presentation",
    type: "meeting",
    date: "2024-01-23",
    time: "03:00 PM",
    duration: "2 hours",
    attendees: ["Sarah Johnson", "Jessica Taylor", "Emily Rodriguez"],
    location: "Client Office",
    color: "bg-accent",
    project: "Website Redesign",
  },
  {
    id: "6",
    title: "Sprint Planning",
    type: "meeting",
    date: "2024-01-24",
    time: "10:00 AM",
    duration: "2 hours",
    attendees: ["Sarah Johnson", "Michael Chen", "Emily Rodriguez", "Alex Kumar"],
    location: "Conference Room B",
    color: "bg-chart-4",
    project: "Mobile App",
  },
  {
    id: "7",
    title: "Deploy to Production",
    type: "task",
    date: "2024-01-24",
    time: "04:00 PM",
    duration: "1 hour",
    attendees: ["David Park", "Michael Chen"],
    location: "",
    color: "bg-chart-5",
    project: "Website Redesign",
  },
  {
    id: "8",
    title: "Marketing Campaign Launch",
    type: "deadline",
    date: "2024-01-25",
    time: "09:00 AM",
    duration: "",
    attendees: ["Jessica Taylor"],
    location: "",
    color: "bg-primary",
    project: "Marketing",
  },
]

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calendarEvents')
      return saved ? JSON.parse(saved) : initialEvents
    }
    return initialEvents
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "meeting",
    date: "",
    time: "",
    duration: "",
    location: "",
    project: "",
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendarEvents', JSON.stringify(events))
    }
  }, [events])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const today = new Date()
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    )
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event: CalendarEvent) => event.date === dateStr)
  }

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
  const selectedDateEvents = events.filter((event: CalendarEvent) => event.date === selectedDateStr)

  const getEventIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return Users
      case "deadline":
        return AlertCircle
      case "task":
        return ListTodo
      default:
        return CalendarIcon
    }
  }

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) return

    const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5", "bg-primary", "bg-accent"]
    const newEventData = {
      id: String(events.length + 1),
      title: newEvent.title,
      type: newEvent.type,
      date: newEvent.date,
      time: newEvent.time || "09:00 AM",
      duration: newEvent.duration || "1 hour",
      attendees: [],
      location: newEvent.location || "",
      color: colors[events.length % colors.length],
      project: newEvent.project || "General",
    }

    setEvents([...events, newEventData])
    setIsCreateDialogOpen(false)
    setNewEvent({
      title: "",
      type: "meeting",
      date: "",
      time: "",
      duration: "",
      location: "",
      project: "",
    })
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter((e: CalendarEvent) => e.id !== eventId))
    }
  }

  const handleDuplicateEvent = (eventId: string) => {
    const event = events.find((e: CalendarEvent) => e.id === eventId)
    if (event) {
      const duplicated = {
        ...event,
        id: String(events.length + 1),
        title: `${event.title} (Copy)`,
      }
      setEvents([...events, duplicated])
    }
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
      <main
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out w-full",
          "pl-0 lg:pl-64",
          sidebarCollapsed && "lg:pl-20"
        )}
      >
        {/* Header */}
        <div className="px-4 lg:px-8 py-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Calendar</h1>
                  <p className="text-sm text-muted-foreground">
                    {events.length} upcoming events this month
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="px-4 lg:px-8 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card className="glass border-glass-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {monthNames[month]} {year}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={previousMonth}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentDate(new Date())
                          setSelectedDate(new Date())
                        }}
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextMonth}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day names */}
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: firstDay }).map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square" />
                    ))}

                    {/* Calendar days */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1
                      const dayEvents = getEventsForDate(day)
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(new Date(year, month, day))}
                          className={cn(
                            "aspect-square rounded-lg p-1 text-sm transition-all hover:bg-secondary relative",
                            isToday(day) && "ring-2 ring-primary",
                            isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          <div className="font-medium">{day}</div>
                          {dayEvents.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {dayEvents.slice(0, 3).map((event: CalendarEvent, idx: number) => (
                                <div
                                  key={idx}
                                  className={cn("h-1 w-1 rounded-full", event.color)}
                                />
                              ))}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Events for selected date */}
            <div className="lg:col-span-1">
              <Card className="glass border-glass-border sticky top-6">
                <CardHeader>
                  <CardTitle className="text-base">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                  <CardDescription>
                    {selectedDateEvents.length > 0
                      ? `${selectedDateEvents.length} event${selectedDateEvents.length > 1 ? "s" : ""}`
                      : "No events scheduled"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {selectedDateEvents.length > 0 ? (
                    selectedDateEvents.map((event: CalendarEvent) => {
                      const EventIcon = getEventIcon(event.type)
                      return (
                        <Card
                          key={event.id}
                          className={cn("glass-subtle border-glass-border", event.color, "border-l-4")}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center bg-background/50")}>
                                  <EventIcon className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{event.title}</h4>
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {event.project}
                                  </Badge>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass border-glass-border">
                                  <DropdownMenuItem onClick={() => alert(`Event: ${event.title}\nDate: ${event.date}\nTime: ${event.time}`)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => alert('Edit feature coming soon')}>
                                    Edit Event
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateEvent(event.id)}>
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    Delete Event
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {event.time}
                                  {event.duration && ` • ${event.duration}`}
                                </span>
                              </div>

                              {event.location && (
                                <div className="flex items-center gap-2">
                                  {event.location.includes("Zoom") ||
                                  event.location.includes("Meet") ? (
                                    <Video className="h-3 w-3" />
                                  ) : (
                                    <MapPin className="h-3 w-3" />
                                  )}
                                  <span>{event.location}</span>
                                </div>
                              )}

                              {event.attendees.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Users className="h-3 w-3" />
                                  <div className="flex -space-x-2">
                                    {event.attendees.slice(0, 3).map((attendee: string, idx: number) => (
                                      <Avatar key={idx} className="h-6 w-6 ring-2 ring-background">
                                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                          {attendee
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {event.attendees.length > 3 && (
                                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs ring-2 ring-background">
                                        +{event.attendees.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No events scheduled for this day
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 gap-2"
                        onClick={() => {
                          setNewEvent({...newEvent, date: selectedDateStr})
                          setIsCreateDialogOpen(true)
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        Add Event
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upcoming Events List */}
          <Card className="glass border-glass-border mt-6">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>All scheduled events for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events
                  .sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event: CalendarEvent) => {
                    const EventIcon = getEventIcon(event.type)
                    const eventDate = new Date(event.date)
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 p-3 rounded-lg glass-subtle hover:bg-secondary/50 transition-colors"
                      >
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", event.color)}>
                          <EventIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {event.project}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {eventDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}
                            </div>
                            {event.attendees.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.attendees.length} attendees
                              </div>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass border-glass-border">
                            <DropdownMenuItem onClick={() => alert(`Event: ${event.title}\nDate: ${event.date}\nTime: ${event.time}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert('Edit feature coming soon')}>
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateEvent(event.id)}>
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="border-glass-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Add a new event to your calendar
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Event Title *</Label>
              <Input
                id="event-title"
                placeholder="Team Meeting"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select
                value={newEvent.type}
                onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
              >
                <SelectTrigger className="glass-subtle border-glass-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-glass-border">
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-date">Date *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="glass-subtle border-glass-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-time">Time</Label>
                <Input
                  id="event-time"
                  placeholder="09:00 AM"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="glass-subtle border-glass-border"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-duration">Duration</Label>
              <Input
                id="event-duration"
                placeholder="1 hour"
                value={newEvent.duration}
                onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                placeholder="Zoom, Conference Room A, etc."
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-project">Project</Label>
              <Input
                id="event-project"
                placeholder="Project name"
                value={newEvent.project}
                onChange={(e) => setNewEvent({ ...newEvent, project: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={!newEvent.title || !newEvent.date}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

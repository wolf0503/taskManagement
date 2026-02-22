"use client"

import { useState, useEffect, useCallback } from "react"
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
  Edit,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CalendarEvent } from "@/lib/types"
import { calendarEventsService } from "@/services/calendar-events.service"
import { toast } from "@/hooks/use-toast"
import { ApiError } from "@/lib/api-client"

const EVENT_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5", "bg-primary", "bg-accent"]

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
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editEvent, setEditEvent] = useState({
    title: "",
    type: "meeting" as CalendarEvent["type"],
    date: "",
    time: "",
    duration: "",
    location: "",
    project: "",
  })
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "meeting" as CalendarEvent["type"],
    date: "",
    time: "",
    duration: "",
    location: "",
    project: "",
  })

  // Fetch events for the currently viewed month
  const fetchEvents = useCallback(async () => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const startDate = `${y}-${String(m + 1).padStart(2, "0")}-01`
    const lastDay = new Date(y, m + 1, 0).getDate()
    const endDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
    setEventsLoading(true)
    setEventsError(null)
    try {
      const list = await calendarEventsService.getEvents({ startDate, endDate })
      setEvents(list)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load events"
      setEventsError(message)
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }, [currentDate])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

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

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date) return
    setIsCreating(true)
    try {
      const color = EVENT_COLORS[events.length % EVENT_COLORS.length]
      const created = await calendarEventsService.createEvent({
        title: newEvent.title,
        type: newEvent.type,
        date: newEvent.date,
        time: newEvent.time || "09:00 AM",
        duration: newEvent.duration || "1 hour",
        location: newEvent.location || "",
        color,
        project: newEvent.project || "General",
      })
      setEvents((prev) => [...prev, created])
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
      toast({ title: "Event created", description: "The event has been added to your calendar." })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to create event"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    try {
      await calendarEventsService.deleteEvent(eventId)
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
      toast({ title: "Event deleted", description: "The event has been removed." })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete event"
      toast({ title: "Error", description: message, variant: "destructive" })
    }
  }

  const handleDuplicateEvent = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId)
    if (!event) return
    try {
      const created = await calendarEventsService.createEvent({
        title: `${event.title} (Copy)`,
        type: event.type,
        date: event.date,
        time: event.time || "09:00 AM",
        duration: event.duration || "",
        attendees: event.attendees ?? [],
        location: event.location || "",
        color: event.color,
        project: event.project || "General",
      })
      setEvents((prev) => [...prev, created])
      toast({ title: "Event duplicated", description: "A copy has been added." })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to duplicate event"
      toast({ title: "Error", description: message, variant: "destructive" })
    }
  }

  const openEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setEditEvent({
      title: event.title,
      type: event.type,
      date: event.date,
      time: event.time || "",
      duration: event.duration || "",
      location: event.location || "",
      project: event.project || "",
    })
  }

  const handleUpdateEvent = async () => {
    if (!editingEvent || !editEvent.title || !editEvent.date) return
    setIsUpdating(true)
    try {
      const updated = await calendarEventsService.updateEvent(editingEvent.id, {
        title: editEvent.title,
        type: editEvent.type,
        date: editEvent.date,
        time: editEvent.time || undefined,
        duration: editEvent.duration || undefined,
        location: editEvent.location || undefined,
        project: editEvent.project || undefined,
      })
      setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? updated : e)))
      setEditingEvent(null)
      toast({ title: "Event updated", description: "The event has been saved." })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to update event"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setIsUpdating(false)
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
                    {eventsLoading
                      ? "Loading…"
                      : eventsError
                        ? eventsError
                        : `${events.length} upcoming event${events.length !== 1 ? "s" : ""} this month`}
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
                                  <DropdownMenuItem onClick={() => openEditEvent(event)}>
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

          {/* Upcoming Events List - only events created via Create Event dialog */}
          <Card className="glass border-glass-border mt-6">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                {eventsLoading
                  ? "Loading events…"
                  : events.length > 0
                    ? "Events for this month"
                    : "Create events to see them here"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventsLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <p className="text-sm">Loading events…</p>
                  </div>
                ) : events.length > 0 ? (
                  [...events]
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event) => {
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
                            <DropdownMenuItem onClick={() => openEditEvent(event)}>
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
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-sm">No events yet</p>
                    <p className="text-xs mt-1">Use &quot;Create Event&quot; to add events to your calendar</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 gap-2"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Create Event
                    </Button>
                  </div>
                )}
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
              disabled={!newEvent.title || !newEvent.date || isCreating}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? "Creating…" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-primary" />
              Edit Event
            </DialogTitle>
            <DialogDescription>Update the event details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-event-title">Title *</Label>
              <Input
                id="edit-event-title"
                value={editEvent.title}
                onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                placeholder="Event title"
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-event-type">Type</Label>
              <Select
                value={editEvent.type}
                onValueChange={(v) => setEditEvent({ ...editEvent, type: v as CalendarEvent["type"] })}
              >
                <SelectTrigger id="edit-event-type" className="glass-subtle border-glass-border">
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
                <Label htmlFor="edit-event-date">Date *</Label>
                <Input
                  id="edit-event-date"
                  type="date"
                  value={editEvent.date}
                  onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                  className="glass-subtle border-glass-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-event-time">Time</Label>
                <Input
                  id="edit-event-time"
                  placeholder="09:00 AM"
                  value={editEvent.time}
                  onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })}
                  className="glass-subtle border-glass-border"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-event-duration">Duration</Label>
              <Input
                id="edit-event-duration"
                placeholder="1 hour"
                value={editEvent.duration}
                onChange={(e) => setEditEvent({ ...editEvent, duration: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-event-location">Location</Label>
              <Input
                id="edit-event-location"
                placeholder="Zoom, Conference Room A, etc."
                value={editEvent.location}
                onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-event-project">Project</Label>
              <Input
                id="edit-event-project"
                placeholder="Project name"
                value={editEvent.project}
                onChange={(e) => setEditEvent({ ...editEvent, project: e.target.value })}
                className="glass-subtle border-glass-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingEvent(null)}>Cancel</Button>
            <Button
              onClick={handleUpdateEvent}
              disabled={!editEvent.title || !editEvent.date || isUpdating}
              className="bg-primary hover:bg-primary/90"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isUpdating ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTasks } from "@/contexts/tasks-context"
import { useProjects } from "@/contexts/projects-context"
import { useColumns } from "@/contexts/columns-context"
import { toast } from "@/hooks/use-toast"
import { CalendarIcon, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Form validation schema
const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  columnId: z.string().min(1, "Column is required"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  tags: z.array(z.string()).optional(),
  assigneeName: z.string().optional(),
  assigneeAvatar: z.string().optional(),
  dueDate: z.date().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  defaultColumnId?: string
}

export function AddTaskDialog({
  open,
  onOpenChange,
  projectId,
  defaultColumnId,
}: AddTaskDialogProps) {
  const { addTask } = useTasks()
  const { getProject } = useProjects()
  const { getColumns, fetchColumns } = useColumns()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")

  const project = getProject(projectId)
  const teamMembers = project?.teamMembers || []
  const columns = getColumns(projectId)
  const firstColumnId = columns.length > 0 ? columns[0].id : ""

  // ✅ Fetch columns from backend when dialog opens
  useEffect(() => {
    if (open && projectId) {
      console.log('🔄 Fetching columns for project:', projectId)
      fetchColumns(projectId, true) // true = simple mode (without tasks)
    }
  }, [open, projectId, fetchColumns])

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      columnId: defaultColumnId || firstColumnId,
      priority: "MEDIUM",
      tags: [],
      assigneeName: "",
      assigneeAvatar: "",
      dueDate: undefined,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control as any,
    name: "tags",
  })

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true)
    try {
      // Format due date to ISO string if present
      const dueDateString = data.dueDate
        ? data.dueDate.toISOString()
        : undefined

      // Get assignee ID (for now, using assigneeName as ID until we have proper user IDs)
      const assigneeId = data.assigneeName || undefined

      const taskPayload = {
        title: data.title,
        description: data.description,
        columnId: data.columnId, // ✅ Now a valid UUID from backend
        priority: data.priority,
        tags: data.tags || [],
        assigneeId,
        dueDate: dueDateString,
      }

      // DEBUG: Log the payload being sent
      console.log('✅ Creating task with payload:', taskPayload)

      await addTask(projectId, taskPayload)

      toast({
        title: "Task created",
        description: `${data.title} has been added successfully.`,
      })

      form.reset()
      setTagInput("")
      onOpenChange(false)
    } catch (error) {
      // DEBUG: Log the full error
      console.error('Task creation error:', error)
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !form.watch("tags")?.includes(tagInput.trim())) {
      append(tagInput.trim())
      setTagInput("")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset({
        title: "",
        description: "",
        columnId: defaultColumnId || firstColumnId,
        priority: "MEDIUM",
        tags: [],
        assigneeName: "",
        assigneeAvatar: "",
        dueDate: undefined,
      })
      setTagInput("")
    } else {
      // Reset to default values when opening
      form.reset({
        title: "",
        description: "",
        columnId: defaultColumnId || firstColumnId,
        priority: "MEDIUM",
        tags: [],
        assigneeName: "",
        assigneeAvatar: "",
        dueDate: undefined,
      })
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to organize your work and track progress.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description (optional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about what needs to be done.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="columnId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={columns.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select column">
                            {columns.find((col) => col.id === field.value)?.title || "Select column"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {columns.map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: column.color }}
                              />
                              <span>{column.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                        {columns.length === 0 && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No columns available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assigneeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const member = teamMembers.find((m) => m.name === value)
                      field.onChange(value)
                      form.setValue("assigneeAvatar", member?.avatar || "")
                    }}
                    defaultValue={field.value}
                    disabled={teamMembers.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee">
                          {field.value ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={
                                    teamMembers.find((m) => m.name === field.value)
                                      ?.avatar || "/placeholder-user.jpg"
                                  }
                                  alt={field.value}
                                />
                                <AvatarFallback className="text-xs">
                                  {field.value[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{field.value}</span>
                            </div>
                          ) : (
                            "Select assignee"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.name} value={member.name}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="text-xs">
                                {member.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                      {teamMembers.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No team members available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Set a due date for this task (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormDescription>
                    Add tags to categorize and organize tasks.
                  </FormDescription>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {fields.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                          >
                            <span>{form.watch("tags")?.[index]}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4"
                              onClick={() => remove(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

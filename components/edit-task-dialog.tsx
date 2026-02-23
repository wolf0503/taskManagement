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
import { useColumns } from "@/contexts/columns-context"
import { projectsService } from "@/services/projects.service"
import { CalendarIcon, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProjectMember, Task } from "@/lib/types"

// Coerce tags to array (API or form may sometimes give a string)
const tagsSchema = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((v) => (Array.isArray(v) ? v : typeof v === "string" ? (v.trim() ? [v.trim()] : []) : []))

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  columnId: z.string().min(1, "Column is required"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  tags: tagsSchema,
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

const UNASSIGNED_VALUE = "__unassigned__"

function memberDisplayName(m: ProjectMember): string {
  const u = m.user
  if (!u) return m.userId
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ")
  return full || u.email || m.userId
}

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  task: Task | null
}

export function EditTaskDialog({
  open,
  onOpenChange,
  projectId,
  task,
}: EditTaskDialogProps) {
  const { updateTask, moveTask } = useTasks()
  const { getColumns, fetchColumns } = useColumns()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  const columns = getColumns(projectId)
  const firstColumnId = columns.length > 0 ? columns[0].id : ""

  useEffect(() => {
    if (open && projectId && getColumns(projectId).length === 0) fetchColumns(projectId, true)
  }, [open, projectId, fetchColumns, getColumns])

  useEffect(() => {
    if (!open || !projectId) return
    setMembersLoading(true)
    projectsService
      .getProjectMembers(projectId)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false))
  }, [open, projectId])

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      columnId: firstColumnId,
      priority: "MEDIUM",
      tags: [],
      assigneeId: UNASSIGNED_VALUE,
      dueDate: undefined,
    },
  })

  // Ensure tags is always an array (API may return string)
  const normalizeTags = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((t): t is string => typeof t === "string") : []

  // Prefill form when task or open changes
  useEffect(() => {
    if (open && task) {
      form.reset({
        title: task.title,
        description: task.description ?? "",
        columnId: task.columnId,
        priority: task.priority,
        tags: normalizeTags(task.tags),
        assigneeId: task.assigneeId && task.assigneeId.trim() ? task.assigneeId : UNASSIGNED_VALUE,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      })
      setTagInput("")
    }
  }, [open, task, form])

  const { fields, append, remove } = useFieldArray({
    control: form.control as any,
    name: "tags",
  })

  const onSubmit = async (data: TaskFormValues) => {
    if (!task) return
    setIsSubmitting(true)
    try {
      const dueDateString = data.dueDate ? data.dueDate.toISOString() : undefined
      const assigneeId =
        data.assigneeId && data.assigneeId !== UNASSIGNED_VALUE ? data.assigneeId.trim() : undefined

      if (data.columnId !== task.columnId) {
        await moveTask(task.id, { columnId: data.columnId, position: 0 })
      }

      await updateTask(task.id, {
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        tags: data.tags ?? [],
        assigneeId,
        dueDate: dueDateString,
      })
      onOpenChange(false)
    } catch {
      // Error toast shown by TasksContext
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
    if (!newOpen) form.reset()
    onOpenChange(newOpen)
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below.
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
                      value={field.value}
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
                      value={field.value}
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
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || UNASSIGNED_VALUE}
                    disabled={membersLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={membersLoading ? "Loading…" : "Select assignee (optional)"}>
                          {field.value && field.value !== UNASSIGNED_VALUE ? (
                            (() => {
                              const member = members.find((m) => m.userId === field.value)
                              if (!member) return field.value
                              return (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={member.user?.avatar ?? undefined} alt={memberDisplayName(member)} />
                                    <AvatarFallback className="text-xs">
                                      {memberDisplayName(member)[0]?.toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{memberDisplayName(member)}</span>
                                </div>
                              )
                            })()
                          ) : (
                            "Unassigned"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED_VALUE}>
                        <span className="text-muted-foreground">Unassigned</span>
                      </SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={member.user?.avatar ?? undefined} alt={memberDisplayName(member)} />
                              <AvatarFallback className="text-xs">
                                {memberDisplayName(member)[0]?.toUpperCase() ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{memberDisplayName(member)}</span>
                          </div>
                        </SelectItem>
                      ))}
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
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags (optional)</FormLabel>
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
                      <Button type="button" variant="outline" size="icon" onClick={handleAddTag} disabled={!tagInput.trim()}>
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
                            <Button type="button" variant="ghost" size="icon" className="h-4 w-4" onClick={() => remove(index)}>
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
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

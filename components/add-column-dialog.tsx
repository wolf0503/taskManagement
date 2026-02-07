"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useColumns } from "@/contexts/columns-context"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Color options for columns (backend expects hex; see BACKEND_COLUMNS_API_REQUEST.md)
const colorOptions = [
  { value: "#6366f1", label: "Blue (To Do)" },
  { value: "#f59e0b", label: "Yellow (In Progress)" },
  { value: "#06b6d4", label: "Cyan (Review)" },
  { value: "#10b981", label: "Green (Done)" },
  { value: "#3b82f6", label: "Chart Blue" },
  { value: "#8b5cf6", label: "Chart Purple" },
  { value: "#ec4899", label: "Chart Pink" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#ef4444", label: "Red" },
]

// Form validation schema
const columnSchema = z.object({
  title: z.string().min(1, "Column title is required").max(50, "Title is too long"),
  color: z.string().min(1, "Color is required"),
})

type ColumnFormValues = z.infer<typeof columnSchema>

interface AddColumnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

export function AddColumnDialog({ open, onOpenChange, projectId }: AddColumnDialogProps) {
  const { addColumn, getColumns } = useColumns()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      title: "",
      color: "#3b82f6",
    },
  })

  const onSubmit = async (data: ColumnFormValues) => {
    setIsSubmitting(true)
    try {
      const position = getColumns(projectId).length
      await addColumn(projectId, {
        title: data.title,
        color: data.color,
        position,
      })

      toast({
        title: "Column created",
        description: `${data.title} column has been added successfully.`,
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create column. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  const selectedColor = form.watch("color")
  const selectedColorOption = colorOptions.find((opt) => opt.value === selectedColor)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Column</DialogTitle>
          <DialogDescription>
            Add a new column to organize your tasks in the board.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Column Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter column title" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name that will be displayed at the top of the column.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color">
                          {selectedColorOption && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border border-border"
                                style={{ backgroundColor: selectedColorOption.value }}
                              />
                              <span>{selectedColorOption.label}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: color.value }}
                            />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a color to identify this column visually.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Preview */}
            {selectedColor && (
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm font-medium mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {form.watch("title") || "Column Title"}
                  </span>
                </div>
              </div>
            )}

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
                {isSubmitting ? "Creating..." : "Create Column"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

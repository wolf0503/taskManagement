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

// Color options for columns
const colorOptions = [
  { value: "var(--status-todo)", label: "Blue (To Do)", preview: "oklch(0.65 0.15 260)" },
  { value: "var(--status-progress)", label: "Yellow (In Progress)", preview: "oklch(0.7 0.18 80)" },
  { value: "var(--status-review)", label: "Cyan (Review)", preview: "oklch(0.65 0.2 180)" },
  { value: "var(--status-done)", label: "Green (Done)", preview: "oklch(0.65 0.2 145)" },
  { value: "var(--chart-1)", label: "Chart Blue", preview: "oklch(0.7 0.15 220)" },
  { value: "var(--chart-2)", label: "Chart Cyan", preview: "oklch(0.65 0.2 180)" },
  { value: "var(--chart-3)", label: "Chart Green", preview: "oklch(0.75 0.15 140)" },
  { value: "var(--chart-4)", label: "Chart Purple", preview: "oklch(0.7 0.18 280)" },
  { value: "var(--chart-5)", label: "Chart Pink", preview: "oklch(0.65 0.15 320)" },
  { value: "var(--primary)", label: "Primary", preview: "oklch(0.7 0.15 220)" },
  { value: "var(--accent)", label: "Accent", preview: "oklch(0.65 0.2 180)" },
  { value: "var(--destructive)", label: "Destructive", preview: "oklch(0.6 0.2 25)" },
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
  const { addColumn } = useColumns()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      title: "",
      color: "var(--chart-1)",
    },
  })

  const onSubmit = async (data: ColumnFormValues) => {
    setIsSubmitting(true)
    try {
      addColumn(projectId, {
        title: data.title,
        color: data.color,
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
                                style={{ backgroundColor: selectedColorOption.preview }}
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
                              style={{ backgroundColor: color.preview }}
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
                    style={{ backgroundColor: selectedColorOption?.preview || selectedColor }}
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

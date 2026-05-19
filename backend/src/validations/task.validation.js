import { z } from "zod";

export const taskSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    assignedTo: z.string().optional().nullable(),
    projectId: z.string().min(1)
  })
});

export const taskUpdateSchema = z.object({
  body: taskSchema.shape.body.partial(),
  params: z.object({ id: z.string().min(1) })
});

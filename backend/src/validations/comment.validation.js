import { z } from "zod";

export const commentSchema = z.object({
  body: z.object({
    content: z.string().min(1),
    taskId: z.string().min(1)
  })
});

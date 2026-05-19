import { z } from "zod";

export const projectSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional().nullable()
  })
});

export const memberSchema = z.object({
  body: z.object({
    email: z.string().email()
  }),
  params: z.object({
    id: z.string().min(1)
  })
});

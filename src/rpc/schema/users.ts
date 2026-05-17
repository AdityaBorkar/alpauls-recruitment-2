import { z } from "zod";

export const listUsersSchema = z.object({
  cursor: z.string().optional(),
  includeBanned: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  role: z.array(z.string()).optional(),
  search: z.string().optional(),
});

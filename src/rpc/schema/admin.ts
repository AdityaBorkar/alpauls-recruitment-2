import { z } from "zod";

export { memberFormSchema as createUserSchema } from "@/schema/auth-form";

export const updateUserSchema = z.object({
  banExpires: z
    .string()
    .datetime()
    .optional()
    .transform((v) => (v ? new Date(v) : null)),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  permissions: z.record(z.string(), z.array(z.string())).optional(),
  role: z
    .enum(["admin", "bd", "rm", "sc", "tl", "caller", "qc", "custom"])
    .optional(),
  supervisorId: z.string().optional(),
  userId: z.string(),
});

export const archiveUserSchema = z.object({
  userId: z.string(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8),
  userId: z.string(),
});

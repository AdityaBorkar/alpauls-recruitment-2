import { z } from "zod";

export {
  clientFormSchema as createClientSchema,
  clientUpdateFormSchema as updateClientSchema,
} from "@/schema/client-form";

export const listClientsSchema = z.object({
  archived: z.boolean().optional(),
  assigneeId: z.array(z.string()).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const getClientByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const archiveClientSchema = z.object({
  id: z.number().int().positive(),
});

export const listClientEventsSchema = z.object({
  clientId: z.number().int().positive(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getUploadUrlSchema = z.object({
  contentType: z.string().min(1),
  filename: z.string().min(1),
});

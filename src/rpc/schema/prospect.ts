import { z } from "zod";

export const createProspectSchema = z.object({
  description: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  name: z.string().min(1),
  phone: z.string().min(1),
});

export const updateProspectSchema = z.object({
  archived: z.boolean().optional(),
  description: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  id: z.number().int().positive(),
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
});

export const listProspectsSchema = z.object({
  archived: z.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const getProspectByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const archiveProspectSchema = z.object({
  id: z.number().int().positive(),
});

export const listProspectEventsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  prospectId: z.number().int().positive(),
});

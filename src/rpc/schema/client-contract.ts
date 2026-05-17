import { z } from "zod";

export {
  contractFormSchema as createContractSchema,
  contractUpdateFormSchema as updateContractSchema,
} from "@/schema/client-contract-form";

const contractStatusSchema = z.enum(["active", "inactive"]);

export { contractStatusSchema };

export const listContractsSchema = z.object({
  archived: z.boolean().optional(),
  assigneeId: z.array(z.string()).optional(),
  clientId: z.number().int().positive().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["title", "createdAt", "startDate", "endDate"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  status: z.array(contractStatusSchema).optional(),
});

export const getContractByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const archiveContractSchema = z.object({
  id: z.number().int().positive(),
});

export const listContractEventsSchema = z.object({
  contractId: z.number().int().positive(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

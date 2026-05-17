import { protectedProcedure } from "@/rpc/middleware";
import {
  archiveContractSchema,
  createContractSchema,
  getContractByIdSchema,
  listContractEventsSchema,
  listContractsSchema,
  updateContractSchema,
} from "@/rpc/schema/client-contract";
import {
  archiveContract,
  createContract,
  getContract,
  listContractEvents,
  listContracts,
  updateContract,
} from "@/services/client-contract-service";

export const contractCreate = protectedProcedure
  .meta({ permission: { action: "create", resource: "client_contracts" } })
  .input(createContractSchema)
  .handler(async ({ context, input }) => {
    const contract = await createContract(input, context.user.id);
    return contract;
  });

export const contractList = protectedProcedure
  .meta({ permission: { action: "read", resource: "client_contracts" } })
  .input(listContractsSchema)
  .handler(async ({ input }) => {
    return listContracts({
      cursor: input.cursor,
      filters: {
        archived: input.archived,
        assigneeId: input.assigneeId,
        clientId: input.clientId,
        search: input.search,
        status: input.status,
      },
      limit: input.limit,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    });
  });

export const contractGetById = protectedProcedure
  .meta({ permission: { action: "read", resource: "client_contracts" } })
  .input(getContractByIdSchema)
  .handler(async ({ input }) => {
    const contract = await getContract(input.id);
    if (!contract) throw new Error("Contract not found");
    return contract;
  });

export const contractUpdate = protectedProcedure
  .meta({ permission: { action: "update", resource: "client_contracts" } })
  .input(updateContractSchema)
  .handler(async ({ context, input }) => {
    const { id, ...updates } = input;
    return updateContract(id, updates, context.user.id);
  });

export const contractArchive = protectedProcedure
  .meta({ permission: { action: "archive", resource: "client_contracts" } })
  .input(archiveContractSchema)
  .handler(async ({ context, input }) => {
    return archiveContract(input.id, context.user.id);
  });

export const contractListEvents = protectedProcedure
  .meta({ permission: { action: "read", resource: "client_contracts" } })
  .input(listContractEventsSchema)
  .handler(async ({ input }) => {
    return listContractEvents(
      input.contractId,
      input.cursor,
      input.limit ?? 50,
    );
  });

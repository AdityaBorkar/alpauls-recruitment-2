import { protectedProcedure } from "@/rpc/middleware";
import {
  archiveProspectSchema,
  createProspectSchema,
  getProspectByIdSchema,
  listProspectEventsSchema,
  listProspectsSchema,
  updateProspectSchema,
} from "@/rpc/schema/prospect";
import { listProspectEvents } from "@/services/prospect-event-service";
import {
  archiveProspect as archiveProspectService,
  createProspect,
  getProspect,
  listProspects,
  updateProspect,
} from "@/services/prospect-service";

export const prospectCreate = protectedProcedure
  .meta({ permission: { action: "create", resource: "prospects" } })
  .input(createProspectSchema)
  .handler(async ({ input, context }) => {
    const prospect = await createProspect({
      ...input,
      createdBy: context.user.id,
    });
    return prospect;
  });

export const prospectUpdate = protectedProcedure
  .meta({ permission: { action: "update", resource: "prospects" } })
  .input(updateProspectSchema)
  .handler(async ({ input, context }) => {
    const { id, ...updates } = input;
    const userId = context.user.id;
    const prospect = await updateProspect(id, updates, userId);
    return prospect;
  });

export const prospectArchive = protectedProcedure
  .meta({ permission: { action: "archive", resource: "prospects" } })
  .input(archiveProspectSchema)
  .handler(async ({ input, context }) => {
    const userId = context.user.id;
    const prospect = await archiveProspectService(input.id, userId);
    return prospect;
  });

export const prospectGetById = protectedProcedure
  .meta({ permission: { action: "read", resource: "prospects" } })
  .input(getProspectByIdSchema)
  .handler(async ({ input }) => {
    const prospect = await getProspect(input.id);
    if (!prospect) throw new Error("Prospect not found");
    return prospect;
  });

export const prospectList = protectedProcedure
  .meta({ permission: { action: "read", resource: "prospects" } })
  .input(listProspectsSchema)
  .handler(async ({ input }) => {
    const result = await listProspects({
      cursor: input.cursor,
      filters: {
        archived: input.archived,
        search: input.search,
      },
      limit: input.limit,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    });
    return result;
  });

export const prospectListEvents = protectedProcedure
  .meta({ permission: { action: "read", resource: "prospects" } })
  .input(listProspectEventsSchema)
  .handler(async ({ input }) => {
    return listProspectEvents(
      input.prospectId,
      input.cursor,
      input.limit ?? 50,
    );
  });

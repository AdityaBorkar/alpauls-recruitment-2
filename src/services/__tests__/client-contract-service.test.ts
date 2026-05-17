import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestDb, resetDb, seedUser, type TestDb } from "#tests/db";
import { setTestDb } from "#tests/setup";
import {
  archiveContract,
  createContract,
  getContract,
  listContractEvents,
  listContracts,
  updateContract,
} from "@/services/client-contract-service";

let db: TestDb;
let pglite: PGlite;
let clientId: number;

beforeAll(async () => {
  const testDb = await createTestDb();
  db = testDb.db;
  pglite = testDb.client;
  setTestDb(db);
});

beforeEach(async () => {
  await resetDb(pglite);

  await seedUser(db, { id: "bd-1", name: "BD User", role: "bd" });
  await seedUser(db, { id: "rm-1", name: "RM User", role: "rm" });

  await pglite.exec(`
    INSERT INTO "clients" ("name", "assignee_id") VALUES ('Test Client', 'bd-1')
  `);
  const result = await pglite.query<{ id: number }>(
    'SELECT "id" FROM "clients" LIMIT 1',
  );
  clientId = result.rows[0]?.id ?? 0;
});

describe("client-contract-service", () => {
  describe("createContract", () => {
    it("creates a contract with required fields", async () => {
      const contract = await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "Test Contract",
        },
        "bd-1",
      );

      expect(contract).toBeDefined();
      expect(contract?.title).toBe("Test Contract");
      expect(contract?.assigneeId).toBe("bd-1");
      expect(contract?.clientId).toBe(clientId);
      expect(contract?.status).toBe("active");
    });

    it("creates a contract with all fields", async () => {
      const contract = await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          description: "A test contract",
          endDate: "2026-12-31",
          pdfLink: "https://example.com/contract.pdf",
          referenceNumber: "CTR-2024-001",
          rmId: "rm-1",
          signedDate: "2026-01-15",
          startDate: "2026-01-01",
          status: "active",
          title: "Full Contract",
        },
        "bd-1",
      );

      expect(contract?.title).toBe("Full Contract");
      expect(contract?.description).toBe("A test contract");
      expect(contract?.referenceNumber).toBe("CTR-2024-001");
      expect(contract?.startDate).toBe("2026-01-01");
      expect(contract?.endDate).toBe("2026-12-31");
      expect(contract?.signedDate).toBe("2026-01-15");
      expect(contract?.pdfLink).toBe("https://example.com/contract.pdf");
      expect(contract?.rmId).toBe("rm-1");
    });

    it("records change events on creation", async () => {
      const contract = await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "Event Test Contract",
        },
        "bd-1",
      );

      const events = await listContractEvents(contract!.id);
      expect(events.items.length).toBeGreaterThan(0);
      expect(events.items.some((e) => e.field === "title")).toBe(true);
    });
  });

  describe("getContract", () => {
    it("returns null for non-existent contract", async () => {
      const contract = await getContract(99999);
      expect(contract).toBeNull();
    });

    it("returns contract with nested relations", async () => {
      const contract = await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          rmId: "rm-1",
          title: "Nested Contract",
        },
        "bd-1",
      );

      expect(contract).toBeDefined();
      expect(contract?.bd?.name).toBeDefined();
      expect(contract?.client?.name).toBe("Test Client");
    });
  });

  describe("updateContract", () => {
    it("updates a contract field and records an event", async () => {
      const contract = await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "Original Title",
        },
        "bd-1",
      );

      const updated = await updateContract(
        contract!.id,
        { title: "Updated Title" },
        "bd-1",
      );

      expect(updated?.title).toBe("Updated Title");

      const events = await listContractEvents(contract!.id);
      const titleEvent = events.items.find((e) => e.field === "title");
      expect(titleEvent).toBeDefined();
      expect(titleEvent?.oldValue).toBe("Original Title");
      expect(titleEvent?.newValue).toBe("Updated Title");
    });

    it("does not record events for unchanged fields", async () => {
      const contract = await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "Same Title",
        },
        "bd-1",
      );

      const eventsBefore = (await listContractEvents(contract!.id)).items
        .length;
      await updateContract(contract!.id, { title: "Same Title" }, "bd-1");
      const eventsAfter = (await listContractEvents(contract!.id)).items.length;

      expect(eventsAfter).toBe(eventsBefore);
    });

    it("updates rmId", async () => {
      const contract = await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "RM Test",
        },
        "bd-1",
      );

      const updated = await updateContract(
        contract!.id,
        { rmId: "rm-1" },
        "bd-1",
      );

      expect(updated?.rmId).toBe("rm-1");
    });
  });

  describe("archiveContract", () => {
    it("archives a contract", async () => {
      const contract = await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "Archive Test",
        },
        "bd-1",
      );

      await archiveContract(contract!.id, "bd-1");

      const archived = await getContract(contract!.id);
      expect(archived?.archived).toBe(true);
    });
  });

  describe("listContracts", () => {
    it("lists non-archived contracts by default", async () => {
      await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "Active Contract",
        },
        "bd-1",
      );
      await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "Another Contract",
        },
        "bd-1",
      );

      const result = await listContracts();
      expect(result.items.length).toBe(2);
    });

    it("excludes archived contracts from default list", async () => {
      const c1 = await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "Active Contract",
        },
        "bd-1",
      );
      await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "To Archive",
        },
        "bd-1",
      );
      await archiveContract(c1!.id, "bd-1");

      const result = await listContracts();
      expect(result.items.length).toBe(1);
      expect(result.items[0]?.title).toBe("To Archive");
    });

    it("filters by status", async () => {
      await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          status: "active",
          title: "Active",
        },
        "bd-1",
      );
      await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          status: "inactive",
          title: "Inactive",
        },
        "bd-1",
      );

      const result = await listContracts({
        filters: { status: ["active"] },
      });
      expect(result.items.length).toBe(1);
      expect(result.items[0]?.title).toBe("Active");
    });

    it("searches by title and reference number", async () => {
      await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          referenceNumber: "CTR-2024-001",
          title: "Alpha Contract",
        },
        "bd-1",
      );
      await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "Beta Contract",
        },
        "bd-1",
      );

      const result = await listContracts({
        filters: { search: "Alpha" },
      });
      expect(result.items.length).toBe(1);

      const refResult = await listContracts({
        filters: { search: "CTR-2024-001" },
      });
      expect(refResult.items.length).toBe(1);
    });
  });

  describe("listContractEvents", () => {
    it("returns events for a contract", async () => {
      const contract = await createContract(
        {
          assigneeId: "bd-1",
          clientId,
          title: "Events Order Test",
        },
        "bd-1",
      );

      const events = await listContractEvents(contract!.id);
      expect(events.items.length).toBeGreaterThan(0);
    });
  });
});

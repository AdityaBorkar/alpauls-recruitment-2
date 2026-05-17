import { describe, expect, it } from "vitest";

import {
  archiveContractSchema,
  contractStatusSchema,
  createContractSchema,
  getContractByIdSchema,
  listContractEventsSchema,
  listContractsSchema,
  updateContractSchema,
} from "@/rpc/schema/client-contract";

describe("client-contract schemas", () => {
  describe("contractStatusSchema", () => {
    it("accepts valid status values", () => {
      expect(contractStatusSchema.safeParse("active").success).toBe(true);
      expect(contractStatusSchema.safeParse("inactive").success).toBe(true);
    });

    it("rejects invalid status", () => {
      expect(contractStatusSchema.safeParse("pending").success).toBe(false);
    });
  });

  describe("createContractSchema", () => {
    it("accepts valid input with required fields", () => {
      const result = createContractSchema.safeParse({
        assigneeId: "bd-1",
        clientId: 1,
        title: "My Contract",
      });
      expect(result.success).toBe(true);
    });

    it("accepts all optional fields", () => {
      const result = createContractSchema.safeParse({
        assigneeId: "bd-1",
        clientId: 1,
        description: "desc",
        endDate: "2026-12-31",
        pdfLink: "https://example.com/contract.pdf",
        referenceNumber: "CTR-001",
        rmId: "rm-1",
        signedDate: "2026-01-15",
        startDate: "2026-01-01",
        status: "active",
        title: "My Contract",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty title", () => {
      const result = createContractSchema.safeParse({
        assigneeId: "bd-1",
        clientId: 1,
        title: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing assigneeId", () => {
      const result = createContractSchema.safeParse({
        clientId: 1,
        title: "Contract",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing clientId", () => {
      const result = createContractSchema.safeParse({
        assigneeId: "bd-1",
        title: "Contract",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateContractSchema", () => {
    it("accepts partial updates", () => {
      const result = updateContractSchema.safeParse({
        id: 1,
        title: "Updated",
      });
      expect(result.success).toBe(true);
    });

    it("accepts nullable fields", () => {
      const result = updateContractSchema.safeParse({
        description: null,
        id: 1,
        rmId: null,
      });
      expect(result.success).toBe(true);
    });

    it("requires id", () => {
      const result = updateContractSchema.safeParse({ title: "No id" });
      expect(result.success).toBe(false);
    });

    it("rejects non-positive id", () => {
      const result = updateContractSchema.safeParse({ id: -1, title: "Bad" });
      expect(result.success).toBe(false);
    });
  });

  describe("listContractsSchema", () => {
    it("accepts empty input (all optional)", () => {
      const result = listContractsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("rejects limit below 1", () => {
      const result = listContractsSchema.safeParse({ limit: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects limit above 100", () => {
      const result = listContractsSchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it("accepts valid sortBy values", () => {
      for (const sortBy of [
        "title",
        "createdAt",
        "startDate",
        "endDate",
      ] as const) {
        const result = listContractsSchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid sortBy", () => {
      const result = listContractsSchema.safeParse({ sortBy: "priority" });
      expect(result.success).toBe(false);
    });
  });

  describe("getContractByIdSchema", () => {
    it("accepts positive integer id", () => {
      const result = getContractByIdSchema.safeParse({ id: 1 });
      expect(result.success).toBe(true);
    });

    it("rejects missing id", () => {
      const result = getContractByIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("archiveContractSchema", () => {
    it("accepts positive integer id", () => {
      const result = archiveContractSchema.safeParse({ id: 5 });
      expect(result.success).toBe(true);
    });
  });

  describe("listContractEventsSchema", () => {
    it("requires contractId", () => {
      const result = listContractEventsSchema.safeParse({ contractId: 1 });
      expect(result.success).toBe(true);
    });

    it("rejects limit below 1", () => {
      const result = listContractEventsSchema.safeParse({
        contractId: 1,
        limit: 0,
      });
      expect(result.success).toBe(false);
    });
  });
});

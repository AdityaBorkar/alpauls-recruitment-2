import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestDb, resetDb, seedUser, type TestDb } from "#tests/db";
import { setTestDb } from "#tests/setup";
import {
  getDirectSubordinateIds,
  getSubordinateIds,
  validateNoCircularSupervisor,
} from "@/services/supervisor-hierarchy-service";

let db: TestDb;
let client: PGlite;

beforeAll(async () => {
  const test = await createTestDb();
  db = test.db;
  client = test.client;
  setTestDb(db);
});

beforeEach(async () => {
  await resetDb(client);
});

describe("supervisor-hierarchy-service", () => {
  describe("getSubordinateIds", () => {
    it("returns correct descendant IDs for a 3-level hierarchy", async () => {
      const a = await seedUser(db, { id: "a", name: "A" });
      const b = await seedUser(db, {
        id: "b",
        name: "B",
        supervisorId: a.id,
      });
      await seedUser(db, { id: "c", name: "C", supervisorId: b.id });

      const ids = await getSubordinateIds("a");

      expect(ids.sort()).toEqual(["b", "c"].sort());
    });

    it("returns empty array for a leaf user (no subordinates)", async () => {
      await seedUser(db, { id: "leaf" });

      const ids = await getSubordinateIds("leaf");

      expect(ids).toEqual([]);
    });

    it("returns all descendants in a branching hierarchy", async () => {
      const a = await seedUser(db, { id: "a", name: "A" });
      const b = await seedUser(db, {
        id: "b",
        name: "B",
        supervisorId: a.id,
      });
      await seedUser(db, {
        id: "d",
        name: "D",
        supervisorId: a.id,
      });
      await seedUser(db, {
        id: "c",
        name: "C",
        supervisorId: b.id,
      });

      const ids = await getSubordinateIds("a");

      expect(ids.sort()).toEqual(["b", "c", "d"].sort());
    });

    it("returns empty array for a non-existent user", async () => {
      const ids = await getSubordinateIds("nonexistent");

      expect(ids).toEqual([]);
    });

    it("uses request-level cache to avoid duplicate CTE execution", async () => {
      const a = await seedUser(db, { id: "a", name: "A" });
      await seedUser(db, {
        id: "b",
        name: "B",
        supervisorId: a.id,
      });

      const cache = new Map<string, string[]>();

      const result1 = await getSubordinateIds("a", cache);
      const result2 = await getSubordinateIds("a", cache);

      expect(result1.sort()).toEqual(["b"].sort());
      expect(result2).toBe(result1);
      expect(cache.has("a")).toBe(true);
    });
  });

  describe("getDirectSubordinateIds", () => {
    it("returns only direct reports (not indirect descendants)", async () => {
      const a = await seedUser(db, { id: "a", name: "A" });
      const b = await seedUser(db, {
        id: "b",
        name: "B",
        supervisorId: a.id,
      });
      await seedUser(db, {
        id: "c",
        name: "C",
        supervisorId: b.id,
      });

      const ids = await getDirectSubordinateIds("a");

      expect(ids).toEqual(["b"]);
    });

    it("returns multiple direct reports", async () => {
      const a = await seedUser(db, { id: "a", name: "A" });
      await seedUser(db, {
        id: "b",
        name: "B",
        supervisorId: a.id,
      });
      await seedUser(db, {
        id: "d",
        name: "D",
        supervisorId: a.id,
      });

      const ids = await getDirectSubordinateIds("a");

      expect(ids.sort()).toEqual(["b", "d"].sort());
    });

    it("returns empty array for a leaf user", async () => {
      await seedUser(db, { id: "leaf" });

      const ids = await getDirectSubordinateIds("leaf");

      expect(ids).toEqual([]);
    });
  });

  describe("validateNoCircularSupervisor", () => {
    it("rejects a direct circular assignment (A supervises B, then B supervises A)", async () => {
      const a = await seedUser(db, { id: "a", name: "A" });
      await seedUser(db, {
        id: "b",
        name: "B",
        supervisorId: a.id,
      });

      await expect(validateNoCircularSupervisor("a", "b")).rejects.toThrow(
        "Circular supervisor chain detected",
      );
    });

    it("rejects an indirect circular assignment (A→B→C, then C supervises A)", async () => {
      const a = await seedUser(db, { id: "a", name: "A" });
      const b = await seedUser(db, {
        id: "b",
        name: "B",
        supervisorId: a.id,
      });
      await seedUser(db, {
        id: "c",
        name: "C",
        supervisorId: b.id,
      });

      await expect(validateNoCircularSupervisor("a", "c")).rejects.toThrow(
        "Circular supervisor chain detected",
      );
    });

    it("rejects a user being their own supervisor", async () => {
      await seedUser(db, { id: "a", name: "A" });

      await expect(validateNoCircularSupervisor("a", "a")).rejects.toThrow(
        "A user cannot be their own supervisor",
      );
    });

    it("allows a valid assignment (D supervises A, where D is not in A's subtree)", async () => {
      const a = await seedUser(db, { id: "a", name: "A" });
      await seedUser(db, {
        id: "b",
        name: "B",
        supervisorId: a.id,
      });
      await seedUser(db, { id: "d", name: "D" });

      await expect(
        validateNoCircularSupervisor("a", "d"),
      ).resolves.toBeUndefined();
    });
  });
});

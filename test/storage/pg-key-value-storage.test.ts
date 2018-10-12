import { Pool } from "pg";
import { PgKeyValueStorage } from "../../src/storage/pg-key-value-storage";
import { getCleanDb } from "../get-clean-db";

describe("PgKeyValueStorage", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); });
  afterEach(async () => { await db.end(); });

  test("it should be able to store, update and retrieve values", async () => {
    const storage = new PgKeyValueStorage<number>("test", db);
    expect(await storage.get("mykey")).toBeUndefined();
    await storage.store("mykey", 42);
    expect(await storage.get("mykey")).toBe(42);
    await storage.store("mykey", 66);
    expect(await storage.get("mykey")).toBe(66);
  });

  test("it should throw if key is an empty string", async () => {
    const storage = new PgKeyValueStorage<number>("test", db);
    await expect(storage.get("")).rejects.toThrow();
    await expect(storage.store("", 55)).rejects.toThrow();
  });

});

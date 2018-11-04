import { Pool } from "pg";
import { getCleanDb } from "../../test/test-util";
import { PgKeyValueStorage } from "./pg-key-value-storage";

describe("PgKeyValueStorage", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); });
  afterEach(async () => { await db.end(); });

  test("it should be able to store, update, delete and retrieve values", async () => {
    const storage = new PgKeyValueStorage<number>("test", db);
    expect(await storage.get("mykey")).toBeUndefined();
    await storage.store("mykey", 42);
    expect(await storage.get("mykey")).toBe(42);
    await storage.store("mykey", 66);
    expect(await storage.get("mykey")).toBe(66);
    await storage.delete("mykey");
    expect(await storage.get("mykey")).toBeUndefined();
    await storage.store("mykey", 42);
    expect(await storage.getAll()).toEqual({ mykey: 42 });
    await storage.deleteAll();
    expect(await storage.getAll()).toEqual({});
  });

  test("it should throw if key is an empty string", async () => {
    const storage = new PgKeyValueStorage<number>("test", db);
    await expect(storage.get("")).rejects.toThrow();
    await expect(storage.store("", 55)).rejects.toThrow();
  });
});

import { Pool } from "pg";
import { getCleanDb } from "../../test/test-util";
import { PgValueStorage } from "./pg-value-storage";

describe("PgValueStorage", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); });
  afterEach(async () => { await db.end(); });

  test("it should be able to store, update and retrieve values", async () => {
    const storage = new PgValueStorage<number>("test", db);
    expect(await storage.get()).toBeUndefined();
    await storage.store(42);
    expect(await storage.get()).toBe(42);
    await storage.store(66);
    expect(await storage.get()).toBe(66);
    await storage.delete();
    expect(await storage.get()).toBeUndefined();
  });

});

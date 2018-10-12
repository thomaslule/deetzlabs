import { Pool } from "pg";
import * as toArray from "stream-to-array";
import { PgEventStorage } from "../../src/storage/pg-event-storage";
import { getCleanDb, makeViewerEvent } from "../test-util";

describe("SqliteEventStorage", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); });
  afterEach(async () => { await db.end(); });

  test("getAllEvents should retrieve all events", async () => {
    const storage = new PgEventStorage(db);
    const event1 = makeViewerEvent();
    const event2 = makeViewerEvent({ sequence: 1 });
    const event3 = makeViewerEvent({ sequence: 2 });
    await storage.store(event1);
    await storage.store(event2);
    await storage.store(event3);
    const events = await toArray(await storage.getAllEvents());
    expect(events).toEqual([event1, event2, event3]);
  });

  test("getEvents should retrieve events for a specified entity", async () => {
    const storage = new PgEventStorage(db);
    const event1 = makeViewerEvent();
    const event2 = makeViewerEvent({ id: "456" });
    await storage.store(event1);
    await storage.store(event2);
    const events = await toArray(await storage.getEvents("viewer", "123"));
    expect(events).toEqual([event1]);
    const events2 = await toArray(await storage.getEvents("viewer", "456"));
    expect(events2).toEqual([event2]);
  });

  test("store should throw in case of duplicate sequence", async () => {
    const storage = new PgEventStorage(db);
    const event = makeViewerEvent();
    await storage.store(event);
    await expect(storage.store(event)).rejects.toThrow();
  });

});

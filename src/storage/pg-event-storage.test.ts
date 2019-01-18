import { Pool } from "pg";
import toArray = require("stream-to-array");
import {
  getCleanDb,
  makeBroadcastEvent,
  makeViewerEvent
} from "../../test/test-util";
import { PgEventStorage } from "./pg-event-storage";

describe("PgEventStorage", () => {
  let db: Pool;
  beforeEach(async () => {
    db = await getCleanDb();
  });
  afterEach(async () => {
    await db.end();
  });

  test("getEvents with no arg should retrieve all events", async () => {
    const storage = new PgEventStorage(db);
    const event1 = makeViewerEvent();
    const event2 = makeBroadcastEvent();
    await storage.store(event1);
    await storage.store(event2);
    const events = await toArray(await storage.getEvents());
    expect(events).toEqual([event1, event2]);
  });

  test("getEvents with aggregate should retrieve events from this aggregate only", async () => {
    const storage = new PgEventStorage(db);
    const event1 = makeViewerEvent();
    const event2 = makeBroadcastEvent();
    await storage.store(event1);
    await storage.store(event2);
    const events = await toArray(await storage.getEvents("viewer"));
    expect(events).toEqual([event1]);
  });

  test("getEvents with aggregate and id should retrieve events from this entity only", async () => {
    const storage = new PgEventStorage(db);
    const event1 = makeViewerEvent();
    const event2 = makeViewerEvent({ id: "456" });
    await storage.store(event1);
    await storage.store(event2);
    const events = await toArray(await storage.getEvents("viewer", "123"));
    expect(events).toEqual([event1]);
  });

  test("getEvents with aggregate, id and fromSequence should retrieve events from the provided sequence", async () => {
    const storage = new PgEventStorage(db);
    const event1 = makeViewerEvent();
    const event2 = makeViewerEvent({ sequence: 1 });
    const event3 = makeViewerEvent({ sequence: 1, id: "456" });
    await storage.store(event1);
    await storage.store(event2);
    await storage.store(event3);
    const events = await toArray(await storage.getEvents("viewer", "123", 1));
    expect(events).toEqual([event2]);
  });

  test("store should throw in case of duplicate sequence", async () => {
    const storage = new PgEventStorage(db);
    const event = makeViewerEvent();
    await storage.store(event);
    await expect(storage.store(event)).rejects.toThrow();
  });

  test("getCurrentSequence should return 0 when there is no event", async () => {
    const storage = new PgEventStorage(db);
    expect(await storage.getCurrentSequence("viewer", "123")).toBe(0);
  });

  test("getCurrentSequence should return the current sequence", async () => {
    const storage = new PgEventStorage(db);
    await storage.store(makeViewerEvent());
    await storage.store(makeViewerEvent({ sequence: 1 }));
    await storage.store(makeViewerEvent({ sequence: 2 }));
    expect(await storage.getCurrentSequence("viewer", "123")).toBe(2);
  });
});

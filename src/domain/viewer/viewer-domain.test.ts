import { EventBus } from "es-objects";
import { Pool } from "pg";
import { getCleanDb, testOptions, wait } from "../../../test/test-util";
import { PgStorage } from "../../storage/pg-storage";
import { Query } from "../query/query";
import { ViewerDomain } from "./viewer-domain";

describe("ViewerDomain", () => {
  let db: Pool;
  beforeEach(async () => {
    db = await getCleanDb();
  });
  afterEach(async () => {
    await db.end();
  });

  test("it should rebuild the decision projection in case of error when publishing an event", async () => {
    const storage = new PgStorage(db);
    const bus = new EventBus(storage.getEventStorage());
    const domain = new ViewerDomain(bus, storage, testOptions);
    await (await domain.get("123")).chatMessage("hi");
    await wait();

    // for some reason the decision projection is lost
    await storage.getKeyValueStorage("viewer-decision").deleteAll();

    // this will fail because the sequence from the decision projection is not good
    await expect((await domain.get("123")).chatMessage("hi")).rejects.toThrow();

    // the decision projection is rebuilt...
    await wait();

    // this one doesnt fail
    await (await domain.get("123")).chatMessage("hi");
    await wait();
  });

  describe("setTopClipper", () => {
    test("it should publish a lost-top-clipper for the previous clipper and a became-top-clipper for the new one", async () => {
      const storage = new PgStorage(db);
      const bus = new EventBus(storage.getEventStorage());
      const handleEvent = jest.fn();
      const domain = new ViewerDomain(bus, storage, testOptions);
      const query = new Query(storage, bus, testOptions);
      await domain.setTopClipper("123", "Someone", query);
      await wait();
      bus.onEvent((e) => {
        if (e.type.includes("top-clipper")) {
          handleEvent(e);
        }
      });

      await domain.setTopClipper("456", "Other", query);
      await wait();

      expect(handleEvent).toHaveBeenCalledTimes(2);
      expect(handleEvent.mock.calls[0][0]).toMatchObject({
        id: "123",
        type: "lost-top-clipper",
      });
      expect(handleEvent.mock.calls[1][0]).toMatchObject({
        id: "456",
        type: "became-top-clipper",
      });
    });

    test("it should only publish a became-top-clipper if this is the first one", async () => {
      const storage = new PgStorage(db);
      const bus = new EventBus(storage.getEventStorage());
      const handleEvent = jest.fn();
      const domain = new ViewerDomain(bus, storage, testOptions);
      const query = new Query(storage, bus, testOptions);
      bus.onEvent((e) => {
        if (e.type.includes("top-clipper")) {
          handleEvent(e);
        }
      });

      await domain.setTopClipper("123", "Someone", query);
      await wait();

      expect(handleEvent).toHaveBeenCalledTimes(1);
      expect(handleEvent.mock.calls[0][0]).toMatchObject({
        id: "123",
        type: "became-top-clipper",
      });
    });

    test("it should not do anything when previous = current", async () => {
      const storage = new PgStorage(db);
      const bus = new EventBus(storage.getEventStorage());
      const handleEvent = jest.fn();
      const domain = new ViewerDomain(bus, storage, testOptions);
      const query = new Query(storage, bus, testOptions);
      await domain.setTopClipper("123", "Someone", query);
      await wait();
      bus.onEvent((e) => {
        if (e.type.includes("top-clipper")) {
          handleEvent(e);
        }
      });

      await domain.setTopClipper("123", "Someone", query);
      await wait();

      expect(handleEvent).not.toHaveBeenCalled();
    });
  });
});

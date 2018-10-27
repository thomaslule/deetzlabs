import { EventBus } from "es-objects";
import { Pool } from "pg";
import { ViewerDomain } from "../../../src/domain/viewer/viewer-domain";
import { PgStorage } from "../../../src/storage/pg-storage";
import { getCleanDb, testOptions, wait } from "../../test-util";

describe("ViewerDomain", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); });
  afterEach(async () => { await db.end(); });

  test("it should respond to !commands command", async () => {
    const storage = new PgStorage(db);
    const bus = new EventBus(storage.getEventStorage());
    const sendChatMessage = jest.fn();
    const domain = new ViewerDomain(bus, sendChatMessage, storage, testOptions);
    const someone = await domain.get("123");

    await someone.chatMessage("not the command");
    expect(sendChatMessage).not.toHaveBeenCalled();

    await someone.chatMessage("!commands");
    expect(sendChatMessage).toHaveBeenCalledWith("Say !achievements to see your current achievements");
  });

  test("it should respond to !achievements command", async () => {
    const storage = new PgStorage(db);
    const bus = new EventBus(storage.getEventStorage());
    const sendChatMessage = jest.fn();
    const domain = new ViewerDomain(bus, sendChatMessage, storage, testOptions);
    const someone = await domain.get("123");
    await someone.giveAchievement("cheerleader", "Someone");

    await someone.chatMessage("!achievements");

    expect(sendChatMessage).toHaveBeenCalledWith("Congratulations Someone for your achievements: Cheerleader");
  });

  test("it should show achievements", async () => {
    const storage = new PgStorage(db);
    const bus = new EventBus(storage.getEventStorage());
    const domain = new ViewerDomain(bus, () => {}, storage, testOptions);
    const showAchievement = jest.fn();
    bus.onEvent((event) => {
      if (event.aggregate === "viewer" && event.type === "got-achievement") {
        showAchievement(event.id, event.achievement);
      }
    });
    const someone = await domain.get("123");

    await someone.cheer(500, "hi");

    expect(showAchievement).toHaveBeenCalledWith("123", "cheerleader");
  });

  test("getAllViewersState should return viewers with their names and achievements", async () => {
    const storage = new PgStorage(db);
    const bus = new EventBus(storage.getEventStorage());
    const domain = new ViewerDomain(bus, () => {}, storage, testOptions);
    const someone = await domain.get("123");
    await someone.cheer(500, "hi", "Someone");
    const other = await domain.get("456");
    await other.chatMessage("hello", "Other");

    expect(await domain.getAllViewersState()).toEqual({
      123: { name: "Someone", achievements: ["cheerleader"] },
      456: { name: "Other", achievements: [] },
    });
  });

  describe("topClipper", () => {
    test(
      "it should publish a lost-top-clipper for the previous clipper and a became-top-clipper for the new one",
      async () => {
        const storage = new PgStorage(db);
        const bus = new EventBus(storage.getEventStorage());
        const handleEvent = jest.fn();
        const domain = new ViewerDomain(bus, () => {}, storage, testOptions);
        await domain.topClipper("123"); await wait();
        bus.onEvent(handleEvent);

        await domain.topClipper("456"); await wait();

        expect(handleEvent).toHaveBeenCalledTimes(2);
        expect(handleEvent.mock.calls[0][0]).toMatchObject({ id: "123", type: "lost-top-clipper" });
        expect(handleEvent.mock.calls[1][0]).toMatchObject({ id: "456", type: "became-top-clipper" });
      },
    );

    test("it should only publish a became-top-clipper if this is the first one", async () => {
      const storage = new PgStorage(db);
      const bus = new EventBus(storage.getEventStorage());
      const handleEvent = jest.fn();
      const domain = new ViewerDomain(bus, () => {}, storage, testOptions);
      bus.onEvent(handleEvent);

      await domain.topClipper("123"); await wait();

      expect(handleEvent).toHaveBeenCalledTimes(1);
      expect(handleEvent.mock.calls[0][0]).toMatchObject({ id: "123", type: "became-top-clipper" });
    });

    test("it should not do anything when previous = current", async () => {
      const storage = new PgStorage(db);
      const bus = new EventBus(storage.getEventStorage());
      const handleEvent = jest.fn();
      const domain = new ViewerDomain(bus, () => {}, storage, testOptions);
      await domain.topClipper("123"); await wait();
      bus.onEvent(handleEvent);

      await domain.topClipper("123"); await wait();

      expect(handleEvent).not.toHaveBeenCalled();
    });
  });
});

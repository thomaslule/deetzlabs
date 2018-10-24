import { EventBus } from "es-objects";
import { Pool } from "pg";
import { ViewerDomain } from "../../../src/domain/viewer/viewer-domain";
import { PgStorage } from "../../../src/storage/pg-storage";
import { getCleanDb, testOptions } from "../../test-util";

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
});

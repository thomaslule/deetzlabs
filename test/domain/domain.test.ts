import { Pool } from "pg";
import { Domain } from "../../src/domain/domain";
import { configureLog } from "../../src/log";
import { PgStorage } from "../../src/storage/pg-storage";
import { getCleanDb, makeBroadcastEvent, makeViewerEvent, testOptions, wait } from "../test-util";

describe("Domain", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); configureLog(testOptions); });
  afterEach(async () => { await db.end(); });

  test("it should respond to !commands command", async () => {
    const storage = new PgStorage(db);
    const sendChatMessage = jest.fn();
    const domain = new Domain(storage, sendChatMessage, () => {}, testOptions);
    const someone = await domain.store.getViewer("123");

    await someone.chatMessage("not the command");
    expect(sendChatMessage).not.toHaveBeenCalled();

    await someone.chatMessage("!commands"); await wait();

    expect(sendChatMessage).toHaveBeenCalledWith("Say !achievements to see your current achievements");
  });

  test("it should respond to !achievements command", async () => {
    const storage = new PgStorage(db);
    const sendChatMessage = jest.fn();
    const domain = new Domain(storage, sendChatMessage, () => {}, testOptions);
    const someone = await domain.store.getViewer("123");
    await someone.giveAchievement("cheerleader", "Someone");

    await someone.chatMessage("!achievements"); await wait();

    expect(sendChatMessage).toHaveBeenCalledWith("Congratulations Someone for your achievements: Cheerleader");
  });

  test("on achievement, it should call showAchievement", async () => {
    const storage = new PgStorage(db);
    const showAchievement = jest.fn();
    const domain = new Domain(storage, () => {}, showAchievement, testOptions);

    const viewer = await domain.store.getViewer("123");
    await viewer.giveAchievement("cheerleader", "Someone"); await wait();

    expect(showAchievement).toHaveBeenCalledWith("Cheerleader", "Someone", "Thank you %USER%!", 0.5);
  });

  test("credits work", async () => {
    const storage = new PgStorage(db);
    const domain = new Domain(storage, () => {}, () => {}, testOptions);

    const broadcast = await domain.store.getBroadcast();
    await broadcast.begin("Tetris");
    await (await domain.store.getViewer("123")).chatMessage("yo", "Someone");
    await (await domain.store.getViewer("123")).cheer(100, "hop");

    expect(await domain.query.getCredits()).toEqual({
      games: ["Tetris"],
      viewers: ["Someone"],
      hosts: [],
      achievements: [{ viewer: "Someone", achievement: "Cheerleader" }],
      subscribes: [],
      donators: ["Someone"],
      follows: [],
    });
  });

  test("rebuild should rebuild all projections", async () => {
    const events = [
      makeBroadcastEvent({ sequence: 0, type: "begun", game: "Tetris" }),
      makeViewerEvent({ sequence: 0, type: "changed-name", name: "Someone" }),
      makeViewerEvent({ sequence: 1, type: "sent-chat-message", message: "hi" }),
      makeViewerEvent({ sequence: 2, type: "got-achievement", achievement: "cheerleader" }),
      { aggregate: "settings", id: "settings", sequence: 0, type: "achievement-volume-changed", volume: 0.8 },
    ];
    const storage = new PgStorage(db);
    for (const event of events) {
      await storage.getEventStorage().store(event);
    }
    const domain = new Domain(storage, () => {}, () => {}, testOptions);

    await domain.rebuild();

    await (await domain.store.getViewer("123")).follow();
    expect((await domain.query.getSettings()).achievementVolume).toBe(0.8);
    expect(domain.query.isBroadcasting()).toBeTruthy();
    const broadcast = await domain.store.getBroadcast();
    await expect(broadcast.begin("Tetris")).rejects.toThrow();
    expect((await domain.query.getCredits()).viewers[0]).toBe("Someone");
    expect((await domain.query.getCredits()).follows[0]).toBe("Someone");
    expect((await domain.query.getViewer("123")).name).toBe("Someone");
    expect(await domain.query.getLastViewerAchievements())
      .toEqual([{ viewerId: "123", viewerName: "Someone", achievement: "cheerleader", date: expect.anything() }]);
  });
});

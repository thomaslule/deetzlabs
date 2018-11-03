import { Pool } from "pg";
import { Domain } from "../../src/domain/domain";
import { configureLog } from "../../src/log";
import { PgStorage } from "../../src/storage/pg-storage";
import { getCleanDb, makeBroadcastEvent, makeViewerEvent, testOptions, wait } from "../test-util";

describe("Domain", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); configureLog(testOptions); });
  afterEach(async () => { await db.end(); });

  test("on achievement, it should call showAchievement", async () => {
    const storage = new PgStorage(db);
    const showAchievement = jest.fn();
    const domain = new Domain(storage, () => {}, showAchievement, testOptions);

    const viewer = await domain.viewer.get("123");
    await viewer.giveAchievement("cheerleader", "Someone"); await wait();

    expect(showAchievement).toHaveBeenCalledWith("Cheerleader", "Someone", "Thank you %USER%!", 0.5);
  });

  test("credits work", async () => {
    const storage = new PgStorage(db);
    const domain = new Domain(storage, () => {}, () => {}, testOptions);

    await domain.broadcast.begin("Tetris");
    await (await domain.viewer.get("123")).chatMessage("yo", "Someone");
    await (await domain.viewer.get("123")).cheer(100, "hop");

    expect(await domain.credits.get()).toEqual({
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

    await (await domain.viewer.get("123")).follow();
    expect(await domain.settings.getAchievementVolume()).toBe(0.8);
    expect(domain.broadcast.isBroadcasting()).toBeTruthy();
    await expect(domain.broadcast.begin("Tetris")).rejects.toThrow();
    expect((await domain.credits.get()).viewers[0]).toBe("Someone");
    expect((await domain.credits.get()).follows[0]).toBe("Someone");
    expect(await domain.viewer.getViewerName("123")).toBe("Someone");
    expect(await domain.viewer.getLastAchievements())
      .toEqual([{ viewer: "123", viewerName: "Someone", achievement: "cheerleader" }]);
  });

});

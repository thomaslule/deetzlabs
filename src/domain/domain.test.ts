import { Pool } from "pg";
import {
  getCleanDb,
  makeBroadcastEvent,
  makeViewerEvent,
  testOptions,
  wait,
} from "../../test/test-util";
import { configureLog } from "../log";
import { PgStorage } from "../storage/pg-storage";
import { Twitch } from "../twitch";
import { Domain } from "./domain";

describe("Domain", () => {
  let db: Pool;
  beforeEach(async () => {
    db = await getCleanDb();
    configureLog(testOptions);
  });
  afterEach(async () => {
    await db.end();
  });

  test("it should respond to !commands command", async () => {
    const storage = new PgStorage(db);
    const sendChatMessage = jest.fn();
    const domain = new Domain(
      storage,
      sendChatMessage,
      () => {},
      {} as Twitch,
      testOptions
    );
    const someone = await domain.store.getViewer("123");

    await someone.chatMessage("not the command");
    await wait();
    expect(sendChatMessage).not.toHaveBeenCalled();

    await someone.chatMessage("!commands");
    await wait();

    expect(sendChatMessage).toHaveBeenCalledWith(
      "Say !achievements to see your current achievements"
    );
  });

  test("it should respond to !achievements command", async () => {
    const storage = new PgStorage(db);
    const sendChatMessage = jest.fn();
    const domain = new Domain(
      storage,
      sendChatMessage,
      () => {},
      {} as Twitch,
      testOptions
    );
    const someone = await domain.store.getViewer("123");
    await someone.setName("Someone");
    await someone.giveAchievement("cheerleader");

    await someone.chatMessage("!achievements");
    await wait();

    expect(sendChatMessage).toHaveBeenCalledWith(
      "Congratulations Someone for your achievements: Cheerleader"
    );
  });

  test("on achievement, it should call showAchievement", async () => {
    const storage = new PgStorage(db);
    const showAchievement = jest.fn();
    const domain = new Domain(
      storage,
      () => {},
      showAchievement,
      {} as Twitch,
      testOptions
    );

    const viewer = await domain.store.getViewer("123");
    await viewer.setName("Someone");
    await viewer.giveAchievement("cheerleader");
    await wait();

    expect(showAchievement).toHaveBeenCalledWith(
      "Cheerleader",
      "Someone",
      "Thank you %USER%!",
      0.5
    );
  });

  test("query.getCredits should return the credits with names", async () => {
    const storage = new PgStorage(db);
    const domain = new Domain(
      storage,
      () => {},
      () => {},
      {} as Twitch,
      testOptions
    );

    const broadcast = await domain.store.getBroadcast();
    await broadcast.begin("Tetris");
    await (await domain.store.getViewer("123")).setName("Someone");
    await (await domain.store.getViewer("123")).chatMessage("yo");
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

  test("it should be able to save settings", async () => {
    const domain = new Domain(
      new PgStorage(db),
      () => {},
      () => {},
      {} as Twitch,
      testOptions
    );
    expect((await domain.query.getSettings()).achievementVolume).toBe(0.5);
    const settings = await domain.store.getSettings();
    await settings.changeAchievementVolume(0.2);
    await wait();
    expect((await domain.query.getSettings()).achievementVolume).toBe(0.2);
    await settings.changeAchievementVolume(0.8);
    await wait();
    expect((await domain.query.getSettings()).achievementVolume).toBe(0.8);
  });

  test("it should be able to start and stop broadcasts", async () => {
    const domain = new Domain(
      new PgStorage(db),
      () => {},
      () => {},
      {} as Twitch,
      testOptions
    );
    expect(domain.query.getBroadcastNumber()).toBeUndefined();
    await (await domain.store.getBroadcast()).begin("Tetris");
    expect(domain.query.getBroadcastNumber()).toBe(1);
    await (await domain.store.getBroadcast()).end();
    expect(domain.query.getBroadcastNumber()).toBeUndefined();
  });

  test("init should rebuild the memory projections", async () => {
    const storage = new PgStorage(db);
    await storage
      .getEventStorage()
      .store(
        makeBroadcastEvent({ sequence: 0, type: "begun", game: "Tetris" })
      );
    const domain = new Domain(
      storage,
      () => {},
      () => {},
      {} as Twitch,
      testOptions
    );
    await domain.init();
    expect(domain.query.isBroadcasting()).toBeTruthy();
  });

  test("rebuild should rebuild all projections", async () => {
    const events = [
      makeBroadcastEvent({ sequence: 0, type: "begun", game: "Tetris" }),
      makeViewerEvent({ sequence: 0, type: "changed-name", name: "Someone" }),
      makeViewerEvent({
        sequence: 1,
        type: "sent-chat-message",
        message: "hi",
      }),
      makeViewerEvent({
        sequence: 2,
        type: "got-achievement",
        achievement: "cheerleader",
      }),
      {
        aggregate: "settings",
        id: "settings",
        sequence: 0,
        type: "achievement-volume-changed",
        volume: 0.8,
      },
    ];
    const storage = new PgStorage(db);
    for (const event of events) {
      await storage.getEventStorage().store(event);
    }
    const domain = new Domain(
      storage,
      () => {},
      () => {},
      {} as Twitch,
      testOptions
    );

    await domain.rebuild();

    await (await domain.store.getViewer("123")).follow();
    expect((await domain.query.getSettings()).achievementVolume).toBe(0.8);
    expect(domain.query.isBroadcasting()).toBeTruthy();
    const broadcast = await domain.store.getBroadcast();
    await expect(broadcast.begin("Tetris")).rejects.toThrow();
    expect((await domain.query.getCredits()).viewers[0]).toBe("Someone");
    expect((await domain.query.getCredits()).follows[0]).toBe("Someone");
    expect((await domain.query.getViewer("123"))!.name).toBe("Someone");
    expect(await domain.query.getLastViewerAchievements()).toEqual([
      {
        viewerId: "123",
        viewerName: "Someone",
        achievement: "cheerleader",
        date: expect.anything(),
      },
    ]);
  });

  test("it should send a message on follow, show achievement alert and populate credits when user interacts", async () => {
    const sendChatMessage = jest.fn();
    const showAchievement = jest.fn();
    const domain = new Domain(
      new PgStorage(db),
      sendChatMessage,
      showAchievement,
      {} as Twitch,
      testOptions
    );

    const viewer = await domain.store.getViewer("123");
    await viewer.setName("Someone");
    await viewer.chatMessage("something nice");
    await viewer.follow();
    await viewer.host(10);
    await wait();

    const credits = await domain.query.getCredits();
    expect(sendChatMessage).toHaveBeenCalled();
    expect(showAchievement).toHaveBeenCalled();
    expect(credits.viewers).toHaveLength(1);
    expect(credits.achievements).toHaveLength(1);
  });

  test("a banned viewer should not appear in chat, in alerts nor in credits", async () => {
    const sendChatMessage = jest.fn();
    const showAchievement = jest.fn();
    const domain = new Domain(
      new PgStorage(db),
      sendChatMessage,
      showAchievement,
      {} as Twitch,
      testOptions
    );

    const viewer = await domain.store.getViewer("123");
    await viewer.setName("Someone");
    await viewer.chatMessage("something bad");
    await viewer.receiveBan();
    await viewer.follow(); // should not trigger welcome message in chat
    await viewer.host(10); // shoud not trigger achievement
    await wait();

    const credits = await domain.query.getCredits();
    expect(sendChatMessage).not.toHaveBeenCalled();
    expect(showAchievement).not.toHaveBeenCalled();
    expect(credits.viewers).toHaveLength(0);
    expect(credits.achievements).toHaveLength(0);
  });
});

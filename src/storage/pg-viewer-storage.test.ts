import { Pool } from "pg";
import { getCleanDb } from "../../test/test-util";
import { PgViewerStorage } from "./pg-viewer-storage";

describe("PgViewerStorage", () => {
  let db: Pool;
  beforeEach(async () => {
    db = await getCleanDb();
  });
  afterEach(async () => {
    await db.end();
  });

  const lastAction = new Date(2018, 1, 1);

  test("update should be able to insert and update with name", async () => {
    const storage = new PgViewerStorage(db);
    expect(await storage.get("123")).toBeUndefined();
    await storage.update("123", lastAction, "Someone");
    expect(await storage.get("123")).toEqual({
      id: "123",
      name: "Someone",
      lastAction,
      banned: false,
    });
    await storage.update("123", lastAction, "Someone2");
    expect(await storage.get("123")).toEqual({
      id: "123",
      name: "Someone2",
      lastAction,
      banned: false,
    });
    await storage.deleteAll();
    expect(await storage.get("123")).toBeUndefined();
  });

  test("update should be able to insert and update without name", async () => {
    const storage = new PgViewerStorage(db);
    await storage.update("123", lastAction);
    expect(await storage.get("123")).toEqual({
      id: "123",
      name: "",
      lastAction,
      banned: false,
    });
    const lastAction2 = new Date(2018, 1, 2);
    await storage.update("123", lastAction2);
    expect(await storage.get("123")).toEqual({
      id: "123",
      name: "",
      lastAction: lastAction2,
      banned: false,
    });
  });

  test("update should be able to insert and update with banned", async () => {
    const storage = new PgViewerStorage(db);
    expect(await storage.get("123")).toBeUndefined();
    await storage.update("123", lastAction, undefined, true);
    expect(await storage.get("123")).toEqual({
      id: "123",
      name: "",
      lastAction,
      banned: true,
    });
    await storage.update("123", lastAction, undefined, false);
    expect(await storage.get("123")).toEqual({
      id: "123",
      name: "",
      lastAction,
      banned: false,
    });
    await storage.deleteAll();
    expect(await storage.get("123")).toBeUndefined();
  });

  test("it should be able add and get achievements", async () => {
    const storage = new PgViewerStorage(db);
    await storage.update("123", lastAction, "Someone");
    expect(await storage.getWithAchievements("123")).toEqual({
      id: "123",
      name: "Someone",
      lastAction,
      banned: false,
      achievements: [],
    });
    await storage.addAchievement("123", "cheerleader", lastAction);
    expect(await storage.getWithAchievements("123")).toEqual({
      id: "123",
      name: "Someone",
      lastAction,
      banned: false,
      achievements: ["cheerleader"],
    });
    await storage.addAchievement("123", "supporter", lastAction);
    expect(await storage.getWithAchievements("123")).toEqual({
      id: "123",
      name: "Someone",
      lastAction,
      banned: false,
      achievements: ["cheerleader", "supporter"],
    });
  });

  test("getMany should return multiple viewers", async () => {
    const storage = new PgViewerStorage(db);
    await storage.update("123", lastAction, "Someone");
    await storage.update("456", lastAction, "Other");
    await storage.update("666", lastAction, "NotThisOne");

    const viewers = await storage.getMany(["123", "456"]);

    expect(viewers).toEqual([
      { id: "123", name: "Someone", lastAction, banned: false },
      { id: "456", name: "Other", lastAction, banned: false },
    ]);
  });

  test("getRecentNames should return all recent viewers names", async () => {
    const storage = new PgViewerStorage(db);
    await storage.update("123", lastAction, "Someone");
    await storage.update("456", lastAction, "Other");

    const names = await storage.getRecentNames();

    expect(names).toHaveLength(2);
    expect(names).toContain("Someone");
    expect(names).toContain("Other");
  });

  test("getAllAchievements should return all achievements", async () => {
    const date1 = new Date(2018, 1, 1);
    const date2 = new Date(2018, 1, 2);
    const date3 = new Date(2018, 1, 3);
    const storage = new PgViewerStorage(db);
    await storage.update("123", lastAction, "Someone");
    await storage.update("456", lastAction, "Other");
    await storage.update("789", lastAction, "Banned", true);
    await storage.addAchievement("123", "supporter", date1);
    await storage.addAchievement("456", "supporter", date2);
    await storage.addAchievement("123", "cheerleader", date3);
    await storage.addAchievement("789", "cheerleader", date3);

    const achievements = await storage.getAllAchievements();

    expect(achievements).toEqual([
      {
        achievement: "supporter",
        viewerId: "123",
        viewerName: "Someone",
        date: date1,
      },
      {
        achievement: "supporter",
        viewerId: "456",
        viewerName: "Other",
        date: date2,
      },
      {
        achievement: "cheerleader",
        viewerId: "123",
        viewerName: "Someone",
        date: date3,
      },
    ]);
  });

  test("getLastAchievements should return the last n achievements", async () => {
    const date1 = new Date(2018, 1, 1);
    const date2 = new Date(2018, 1, 2);
    const date3 = new Date(2018, 1, 3);
    const storage = new PgViewerStorage(db);
    await storage.update("123", lastAction, "Someone");
    await storage.update("456", lastAction, "Other");
    await storage.update("789", lastAction, "Banned", true);
    await storage.addAchievement("123", "supporter", date1);
    await storage.addAchievement("456", "supporter", date2);
    await storage.addAchievement("123", "cheerleader", date3);
    await storage.addAchievement("789", "cheerleader", date3);

    const achievements = await storage.getLastAchievements(2);

    expect(achievements).toEqual([
      {
        achievement: "cheerleader",
        viewerId: "123",
        viewerName: "Someone",
        date: date3,
      },
      {
        achievement: "supporter",
        viewerId: "456",
        viewerName: "Other",
        date: date2,
      },
    ]);
  });
});

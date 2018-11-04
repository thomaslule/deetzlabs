import { Pool } from "pg";
import { getCleanDb } from "../../test/test-util";
import { PgViewerStorage } from "./pg-viewer-storage";

describe("PgViewerStorage", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); });
  afterEach(async () => { await db.end(); });

  test("it should be able to store, get, update and delete viewers", async () => {
    const storage = new PgViewerStorage(db);
    expect(await storage.get("123")).toBeUndefined();
    await storage.store({ id: "123", name: "Someone" });
    expect(await storage.get("123")).toEqual({ id: "123", name: "Someone" });
    await storage.store({ id: "123", name: "Someone2" });
    expect(await storage.get("123")).toEqual({ id: "123", name: "Someone2" });
    await storage.deleteAll();
    expect(await storage.get("123")).toBeUndefined();
  });

  test("it should be able add and get achievements", async () => {
    const storage = new PgViewerStorage(db);
    await storage.store({ id: "123", name: "Someone" });
    expect(await storage.getWithAchievements("123"))
      .toEqual({ id: "123", name: "Someone", achievements: [] });
    await storage.addAchievement("123", "cheerleader", new Date());
    expect(await storage.getWithAchievements("123"))
        .toEqual({ id: "123", name: "Someone", achievements: ["cheerleader"] });
    await storage.addAchievement("123", "supporter", new Date());
    expect(await storage.getWithAchievements("123"))
        .toEqual({ id: "123", name: "Someone", achievements: ["cheerleader", "supporter"] });
  });

  test("getMany should return multiple viewers", async () => {
    const storage = new PgViewerStorage(db);
    await storage.store({ id: "123", name: "Someone" });
    await storage.store({ id: "456", name: "Other" });
    await storage.store({ id: "666", name: "NotThisOne" });

    const viewers = await storage.getMany(["123", "456"]);

    expect(viewers).toEqual([{ id: "123", name: "Someone" }, { id: "456", name: "Other" }]);
  });

  test("getAllNames should return all viewers names", async () => {
    const storage = new PgViewerStorage(db);
    await storage.store({ id: "123", name: "Someone" });
    await storage.store({ id: "456", name: "Other" });

    const names = await storage.getAllNames();

    expect(names).toEqual(["Other", "Someone"]);
  });

  test("getAllAchievements should return all achievements", async () => {
    const date1 = new Date(2018, 1, 1);
    const date2 = new Date(2018, 1, 2);
    const date3 = new Date(2018, 1, 3);
    const storage = new PgViewerStorage(db);
    await storage.store({ id: "123", name: "Someone" });
    await storage.store({ id: "456", name: "Other" });
    await storage.addAchievement("123", "supporter", date1);
    await storage.addAchievement("456", "supporter", date2);
    await storage.addAchievement("123", "cheerleader", date3);

    const achievements = await storage.getAllAchievements();

    expect(achievements).toEqual([
      { achievement: "supporter", viewerId: "123", viewerName: "Someone", date: date1 },
      { achievement: "supporter", viewerId: "456", viewerName: "Other", date: date2 },
      { achievement: "cheerleader", viewerId: "123", viewerName: "Someone", date: date3 },
    ]);
  });

  test("getLastAchievements should return the last n achievements", async () => {
    const date1 = new Date(2018, 1, 1);
    const date2 = new Date(2018, 1, 2);
    const date3 = new Date(2018, 1, 3);
    const storage = new PgViewerStorage(db);
    await storage.store({ id: "123", name: "Someone" });
    await storage.store({ id: "456", name: "Other" });
    await storage.addAchievement("123", "supporter", date1);
    await storage.addAchievement("456", "supporter", date2);
    await storage.addAchievement("123", "cheerleader", date3);

    const achievements = await storage.getLastAchievements(2);

    expect(achievements).toEqual([
      { achievement: "cheerleader", viewerId: "123", viewerName: "Someone", date: date3 },
      { achievement: "supporter", viewerId: "456", viewerName: "Other", date: date2 },
    ]);
  });
});

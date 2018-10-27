import { Pool } from "pg";
import { Domain } from "../../src/domain/domain";
import { configureLog } from "../../src/log";
import { PgStorage } from "../../src/storage/pg-storage";
import { getCleanDb, testOptions } from "../test-util";

describe("Domain", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); configureLog(testOptions); });
  afterEach(async () => { await db.end(); });

  test("on achievement, it should call showAchievement", async () => {
    const storage = new PgStorage(db);
    const showAchievement = jest.fn();
    const domain = new Domain(storage, () => {}, showAchievement, testOptions);

    const viewer = await domain.viewer.get("123");
    await viewer.giveAchievement("cheerleader", "Someone");

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

});

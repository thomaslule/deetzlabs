import { EventBus } from "es-objects";
import { Pool } from "pg";
import { SettingsDomain } from "../../../src/domain/settings/settings-domain";
import { PgStorage } from "../../../src/storage/pg-storage";
import { getCleanDb, wait } from "../../test-util";

describe("SettingsDomain", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); });
  afterEach(async () => { await db.end(); });

  test("it should be able to change the achievement volume", async () => {
    const storage = new PgStorage(db);
    const bus = new EventBus(storage.getEventStorage());
    const domain = new SettingsDomain(bus, storage);

    expect(await domain.getAchievementVolume()).toBe(0.5);
    await (await domain.get()).changeAchievementVolume(0.2); await wait();
    expect(await domain.getAchievementVolume()).toBe(0.2);
  });

  test("it should be able to change the followers goal", async () => {
    const storage = new PgStorage(db);
    const bus = new EventBus(storage.getEventStorage());
    const domain = new SettingsDomain(bus, storage);

    expect((await domain.getFollowersGoal()).goal).toBe(100);
    await (await domain.get()).changeFollowersGoal({ goal: 666, html: "", css: "" }); await wait();
    expect((await domain.getFollowersGoal()).goal).toBe(666);
  });
});

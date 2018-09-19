import { EventBus, InMemoryEventStorage, InMemoryValueStorage } from "es-objects";
import { SettingsDomain } from "../../../src/domain/settings/settings-domain";

describe("SettingsDomain", () => {
  test("it should be able to change the achievement volume", async () => {
    const bus = new EventBus(new InMemoryEventStorage());
    const domain = new SettingsDomain(bus, new InMemoryValueStorage(), new InMemoryValueStorage());

    expect(await domain.getAchievementVolume()).toBe(0.5);
    await (await domain.get()).changeAchievementVolume(0.2);
    expect(await domain.getAchievementVolume()).toBe(0.2);
  });

  test("it should be able to change the followers goal", async () => {
    const bus = new EventBus(new InMemoryEventStorage());
    const domain = new SettingsDomain(bus, new InMemoryValueStorage(), new InMemoryValueStorage());

    expect((await domain.getFollowersGoal()).goal).toBe(10);
    await (await domain.get()).changeFollowersGoal({ goal: 666, html: "", css: "" });
    expect((await domain.getFollowersGoal()).goal).toBe(666);
  });
});

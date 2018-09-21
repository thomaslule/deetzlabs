import { InMemoryValueStorage } from "es-objects";
import {
  DistributedAchievementsProjection,
} from "../../../../src/domain/viewer/projections/distributed-achievements-projection";
import { makeEvent } from "../../../test-util";

describe("ViewerAchievementsProjection", () => {
  test("it should store the distributed achievements", async () => {
    const proj = new DistributedAchievementsProjection(new InMemoryValueStorage());

    expect(await proj.get()).toEqual([]);

    await proj.handleEvent(makeEvent({ type: "got-achievement", achievement: "cheerleader" }));
    expect(await proj.get()).toEqual([
      { viewer: "123", achievement: "cheerleader" },
    ]);

    await proj.handleEvent(makeEvent({ type: "got-achievement", achievement: "supporter" }));
    expect(await proj.get()).toEqual([
      { viewer: "123", achievement: "cheerleader" },
      { viewer: "123", achievement: "supporter" },
    ]);
  });
});

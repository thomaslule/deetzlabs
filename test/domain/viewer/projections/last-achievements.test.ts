import { InMemoryKeyValueStorage, InMemoryValueStorage } from "es-objects";
import { LastAchievementsProjection } from "../../../../src/domain/viewer/projections/last-achievements-projection";
import { ViewerProjection } from "../../../../src/domain/viewer/projections/viewer-projection";
import { makeViewerEvent } from "../../../test-util";

describe("ViewerAchievementsProjection", () => {
  test("it should store the distributed achievements", async () => {
    const proj = new LastAchievementsProjection(new InMemoryValueStorage());

    expect(await proj.getState()).toEqual([]);

    await proj.handleEvent(makeViewerEvent({ type: "got-achievement", achievement: "cheerleader" }));
    expect(await proj.getState()).toEqual([
      { viewer: "123", achievement: "cheerleader" },
    ]);

    await proj.handleEvent(makeViewerEvent({ type: "got-achievement", achievement: "supporter" }));
    expect(await proj.getState()).toEqual([
      { viewer: "123", achievement: "supporter" },
      { viewer: "123", achievement: "cheerleader" },
    ]);
  });

  test("it should store only the last 5 achievements", async () => {
    const proj = new LastAchievementsProjection(new InMemoryValueStorage([
      { viewer: "123", achievement: "ach5" },
      { viewer: "123", achievement: "ach4" },
      { viewer: "123", achievement: "ach3" },
      { viewer: "123", achievement: "ach2" },
      { viewer: "123", achievement: "ach1" },
    ]));
    await proj.handleEvent(makeViewerEvent({ type: "got-achievement", achievement: "ach6" }));
    const state = await proj.getState();
    expect(state).toHaveLength(5);
    expect(state[0].achievement).toBe("ach6");
    expect(state[4].achievement).toBe("ach2");
  });

  test("getWithNames should return the achievements with the viewer name", async () => {
    const proj = new LastAchievementsProjection(new InMemoryValueStorage([
      { viewer: "456", achievement: "ach3" },
      { viewer: "123", achievement: "ach2" },
      { viewer: "123", achievement: "ach1" },
    ]));
    const viewerProj = new ViewerProjection(new InMemoryKeyValueStorage({
      123: { name: "Someone", achievements: []},
      456: { name: "Other", achievements: []},
    }));

    expect(await proj.getWithNames(viewerProj)).toEqual([
      { viewer: "456", achievement: "ach3", viewerName: "Other" },
      { viewer: "123", achievement: "ach2", viewerName: "Someone" },
      { viewer: "123", achievement: "ach1", viewerName: "Someone" },
    ]);
  });
});

import { ViewersProjection } from "../../../../src/domain/viewer/projections/viewers-projection";
import { InMemoryViewerStorage } from "../../../in-memory-storage";
import { makeViewerEvent } from "../../../test-util";

describe("ViewersProjection", () => {

  const changedNameEvent = makeViewerEvent({ type: "changed-name", name: "Someone" });

  test("it should store name changes", async () => {
    const proj = new ViewersProjection(new InMemoryViewerStorage());
    await proj.handleEvent(changedNameEvent);
    expect(await proj.get("123")).toEqual({ id: "123", name: "Someone", achievements: [] });
    await proj.handleEvent({...changedNameEvent, name: "NewName"});
    expect(await proj.get("123")).toEqual({ id: "123", name: "NewName", achievements: [] });
  });

  test("it should do one retry when the viewer is currently unknown", async () => {
    const proj = new ViewersProjection(new InMemoryViewerStorage());
    const getPromise = proj.get("123");
    await proj.handleEvent(changedNameEvent);

    // the proj got the name from the event even if it was issued AFTER the get
    expect(await getPromise).toEqual({ id: "123", name: "Someone", achievements: [] });
  });

  test("it should store the distributed achievements", async () => {
    const proj = new ViewersProjection(new InMemoryViewerStorage());
    await proj.handleEvent(changedNameEvent);

    expect(await proj.get("123")).toEqual({ id: "123", name: "Someone", achievements: [] });

    await proj.handleEvent(makeViewerEvent({ type: "got-achievement", achievement: "cheerleader" }));
    expect(await proj.get("123")).toEqual({ id: "123", name: "Someone", achievements: ["cheerleader"] });

    await proj.handleEvent(makeViewerEvent({ type: "got-achievement", achievement: "supporter" }));
    expect(await proj.get("123")).toEqual({ id: "123", name: "Someone", achievements: ["cheerleader", "supporter"] });
  });

  test("getAll should return all the viewers states", async () => {
    const proj = new ViewersProjection(new InMemoryViewerStorage());
    await proj.handleEvent(changedNameEvent);
    await proj.handleEvent(makeViewerEvent({ type: "got-achievement", achievement: "cheerleader" }));
    await proj.handleEvent({ ...changedNameEvent, id: "456", name: "Other" });

    expect(await proj.getAll()).toHaveLength(2);
    expect(await proj.getAll()).toContainEqual({ id: "123", name: "Someone", achievements: ["cheerleader"] });
    expect(await proj.getAll()).toContainEqual({ id: "456", name: "Other", achievements: [] });
  });

  test("it should return undefined for an unknown id or an unamed viewer", async () => {
    const proj = new ViewersProjection(new InMemoryViewerStorage());
    expect(await proj.get("123")).toBeUndefined();
    await proj.handleEvent(makeViewerEvent({ type: "got-achievement", achievement: "cheerleader" }));
    expect(await proj.get("123")).toBeUndefined();
  });

});

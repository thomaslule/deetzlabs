import { InMemoryKeyValueStorage } from "es-objects";
import { ViewerProjection } from "../../../../src/domain/viewer/projections/viewer-projection";
import { makeViewerEvent } from "../../../test-util";

describe("ViewerProjection", () => {
  test("it should store the viewer name and achievements", async () => {
    const proj = new ViewerProjection(new InMemoryKeyValueStorage());

    expect(await proj.getState("123")).toEqual({ name: undefined, achievements: [] });

    await proj.handleEvent(makeViewerEvent({ type: "changed-name", name: "Someone" }));
    expect(await proj.getState("123")).toEqual({ name: "Someone", achievements: [] });

    await proj.handleEvent(makeViewerEvent({ type: "got-achievement", achievement: "cheerleader" }));
    expect(await proj.getState("123")).toEqual({ name: "Someone", achievements: ["cheerleader"] });
  });

  test("it should do one retry when the viewer name is currently unknown", async () => {
    const proj = new ViewerProjection(new InMemoryKeyValueStorage());
    const getPromise = proj.getState("123");
    await proj.handleEvent(makeViewerEvent({ type: "changed-name", name: "Someone" }));

    // the proj got the name from the event even if it was issued AFTER the get
    expect(await getPromise).toEqual({ name: "Someone", achievements: [] });
  });

});

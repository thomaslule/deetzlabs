import { InMemoryKeyValueStorage } from "es-objects";
import { DisplayNameProjection } from "../../../../src/domain/viewer/projections/display-name-projection";
import { makeEvent } from "../../../test-util";

describe("DisplayNameProjection", () => {

  const event = makeEvent({ type: "changed-display-name", displayName: "Someone" });

  test("it should return the displayName found in the event", async () => {
    const proj = new DisplayNameProjection(new InMemoryKeyValueStorage());
    await proj.handleEvent(event);
    expect(await proj.get("123")).toEqual("Someone");
  });

  test("it should do one retry when the displayName is currently unknown", async () => {
    const proj = new DisplayNameProjection(new InMemoryKeyValueStorage());
    const getPromise = proj.get("123");
    await proj.handleEvent(event);

    // the proj got the displayName from the event even if it was issued AFTER the get
    expect(await getPromise).toEqual("Someone");
  });

  test("it should undefined for an unknown id", async () => {
    const proj = new DisplayNameProjection(new InMemoryKeyValueStorage());
    expect(await proj.get("123")).toBeUndefined();
  });

});

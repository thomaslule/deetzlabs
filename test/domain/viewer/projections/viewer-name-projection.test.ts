import { InMemoryKeyValueStorage } from "es-objects";
import { ViewerNameProjection } from "../../../../src/domain/viewer/projections/viewer-name-projection";
import { makeEvent } from "../../../test-util";

describe("NameProjection", () => {

  const event = makeEvent({ type: "changed-name", name: "Someone" });

  test("it should return the name found in the event", async () => {
    const proj = new ViewerNameProjection(new InMemoryKeyValueStorage());
    await proj.handleEvent(event);
    expect(await proj.get("123")).toEqual("Someone");
  });

  test("it should do one retry when the name is currently unknown", async () => {
    const proj = new ViewerNameProjection(new InMemoryKeyValueStorage());
    const getPromise = proj.get("123");
    await proj.handleEvent(event);

    // the proj got the name from the event even if it was issued AFTER the get
    expect(await getPromise).toEqual("Someone");
  });

  test("it should undefined for an unknown id", async () => {
    const proj = new ViewerNameProjection(new InMemoryKeyValueStorage());
    expect(await proj.get("123")).toBeUndefined();
  });

});

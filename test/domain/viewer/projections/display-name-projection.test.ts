import { InMemoryKeyValueStorage } from "es-objects";
import { DisplayNameProjection } from "../../../../src/domain/viewer/projections/display-name-projection";

describe("DisplayNameProjection", () => {

  const chatEvent = {
    aggregate: "viewer", id: "123", sequence: 0, insertDate: new Date().toISOString(),
    type: "sent-chat-message", displayName: "Someone",
  };

  test("it should return the displayName found in an event", async () => {
    const proj = new DisplayNameProjection(new InMemoryKeyValueStorage());
    await proj.handleEvent(chatEvent);
    expect(await proj.get("123")).toEqual("Someone");
  });

  test("it should ignore events without displayName", async () => {
    const proj = new DisplayNameProjection(new InMemoryKeyValueStorage());
    const { displayName, ...rest } = chatEvent;
    await proj.handleEvent(chatEvent);
    await proj.handleEvent(rest);
    expect(await proj.get("123")).toEqual("Someone");
  });

  test("it should do one retry when the displayName is currently unknown", async () => {
    const proj = new DisplayNameProjection(new InMemoryKeyValueStorage());
    const getPromise = proj.get("123");
    await proj.handleEvent(chatEvent);

    // the proj got the displayName from the event even if it was issued AFTER the get
    expect(await getPromise).toEqual("Someone");
  });

  test("it should undefined for an unknown id", async () => {
    const proj = new DisplayNameProjection(new InMemoryKeyValueStorage());
    expect(await proj.get("123")).toBeUndefined();
  });

});

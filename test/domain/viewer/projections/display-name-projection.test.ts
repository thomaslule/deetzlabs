import { InMemoryKeyValueStorage } from "es-objects";
import { DisplayNameProjection } from "../../../../src/domain/viewer/projections/display-name-projection";

describe("DisplayNameProjection", () => {

  const chatEvent = {
    aggregate: "viewer", id: "someone", sequence: 0, insertDate: new Date().toISOString(),
    type: "sent-chat-message", displayName: "Someone",
  };

  test("it should return the id when it doesnt know the displayName", async () => {
    const proj = new DisplayNameProjection(new InMemoryKeyValueStorage());
    expect(await proj.get("someone")).toEqual("someone");
  });

  test("it should return the displayName found in a send-chat-message event", async () => {
    const proj = new DisplayNameProjection(new InMemoryKeyValueStorage());
    await proj.handleEvent(chatEvent);
    expect(await proj.get("someone")).toEqual("Someone");
  });

  test("it should ignore sent-chat-message events without displayName", async () => {
    const proj = new DisplayNameProjection(new InMemoryKeyValueStorage());
    const { displayName, ...rest } = chatEvent;
    await proj.handleEvent(rest);
    expect(await proj.get("someone")).toEqual("someone");
  });
});

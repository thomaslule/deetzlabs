import { InMemoryValueStorage } from "es-objects";
import { BroadcastProjection } from "../../../src/domain/broadcast/broadcast-projection";
import { begun, ended } from "../../../src/domain/broadcast/events";
import { makeBroadcastEvent } from "../../test-util";

describe("BroadcastProjection", () => {
  test("it should increment a broadcast number", async () => {
    const broadcastNo = new BroadcastProjection(new InMemoryValueStorage());
    await broadcastNo.handleEvent(makeBroadcastEvent(begun("Tetris")));
    expect(await broadcastNo.getBroadcastNumber()).toBe(1);
    await broadcastNo.handleEvent(makeBroadcastEvent(ended()));
    await broadcastNo.handleEvent(makeBroadcastEvent(begun("Tetris")));
    expect(await broadcastNo.getBroadcastNumber()).toBe(2);
  });
});

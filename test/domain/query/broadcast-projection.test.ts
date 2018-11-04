import { begun, ended } from "../../../src/domain/broadcast/events";
import { BroadcastProjection } from "../../../src/domain/query/broadcast-projection";
import { makeBroadcastEvent } from "../../test-util";

describe("BroadcastProjection", () => {
  test("it should increment a broadcast number", () => {
    const broadcast = new BroadcastProjection();
    broadcast.handleEvent(makeBroadcastEvent(begun("Tetris")));
    expect(broadcast.getBroadcastNumber()).toBe(1);
    broadcast.handleEvent(makeBroadcastEvent(ended()));
    expect(broadcast.getBroadcastNumber()).toBeUndefined();
    broadcast.handleEvent(makeBroadcastEvent(begun("Tetris")));
    expect(broadcast.getBroadcastNumber()).toBe(2);
  });
});

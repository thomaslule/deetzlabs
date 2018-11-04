import { makeBroadcastEvent } from "../../../test/test-util";
import { begun, ended } from "../broadcast/events";
import { BroadcastProjection } from "./broadcast-projection";

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

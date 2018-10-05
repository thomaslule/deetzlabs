import { EventBus, InMemoryEventStorage } from "es-objects";
import { BroadcastDomain } from "../../../src/domain/broadcast/broadcast-domain";
import { InMemoryStorage } from "../../in-memory-storage";

describe("BroadcastDomain", () => {
  test("it should track broadcasts", async () => {
    const bus = new EventBus(new InMemoryEventStorage());
    const domain = new BroadcastDomain(bus, new InMemoryStorage());

    expect(await domain.isBroadcasting()).toBeFalsy();
    await domain.begin("Tetris");
    expect(await domain.isBroadcasting()).toBeTruthy();
    expect(await domain.getBroadcastNumber()).toBe(1);
    expect(await domain.getGame()).toBe("Tetris");
    await domain.end();
    expect(await domain.isBroadcasting()).toBeFalsy();
    await domain.begin("Zelda");
    expect(await domain.isBroadcasting()).toBeTruthy();
    expect(await domain.getBroadcastNumber()).toBe(2);
    expect(await domain.getGame()).toBe("Zelda");
  });
});

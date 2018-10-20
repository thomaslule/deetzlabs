import { EventBus } from "es-objects";
import { Pool } from "pg";
import { BroadcastDomain } from "../../../src/domain/broadcast/broadcast-domain";
import { PgStorage } from "../../../src/storage/pg-storage";
import { arrayToStream, getCleanDb, makeBroadcastEvent } from "../../test-util";

describe("BroadcastDomain", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); });
  afterEach(async () => { await db.end(); });

  test("it should track broadcasts", async () => {
    const storage = new PgStorage(db);
    const bus = new EventBus(storage.getEventStorage());
    const domain = new BroadcastDomain(bus, storage);

    expect(domain.isBroadcasting()).toBeFalsy();
    await domain.begin("Tetris");
    expect(domain.isBroadcasting()).toBeTruthy();
    expect(domain.getBroadcastNumber()).toBe(1);
    expect(domain.getGame()).toBe("Tetris");
    await domain.end();
    expect(domain.isBroadcasting()).toBeFalsy();
    expect(domain.getBroadcastNumber()).toBeUndefined();
    await domain.begin("Zelda");
    expect(domain.isBroadcasting()).toBeTruthy();
    expect(domain.getBroadcastNumber()).toBe(2);
    expect(domain.getGame()).toBe("Zelda");
  });

  test("initCache should init the projection", async () => {
    const storage = new PgStorage(db);
    const domain = new BroadcastDomain(new EventBus(storage.getEventStorage()), storage);

    await domain.initCache(arrayToStream([
      makeBroadcastEvent({ type: "begun", game: "Tetris" }),
      makeBroadcastEvent({ type: "ended" }),
      makeBroadcastEvent({ type: "begun", game: "Zelda" }),
    ]));

    expect(domain.isBroadcasting()).toBeTruthy();
    expect(domain.getBroadcastNumber()).toBe(2);
    expect(domain.getGame()).toBe("Zelda");
  });
});

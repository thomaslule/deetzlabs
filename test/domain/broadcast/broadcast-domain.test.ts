import { EventBus } from "es-objects";
import { Pool } from "pg";
import { BroadcastDomain } from "../../../src/domain/broadcast/broadcast-domain";
import { PgStorage } from "../../../src/storage/pg-storage";
import { getCleanDb } from "../../get-clean-db";
import { wait } from "../../test-util";

describe("BroadcastDomain", () => {
  let db: Pool;
  beforeEach(async () => { db = await getCleanDb(); });
  afterEach(async () => { await db.end(); });

  test("it should track broadcasts", async () => {
    const storage = new PgStorage(db);
    const bus = new EventBus(storage.getEventStorage());
    const domain = new BroadcastDomain(bus, storage);

    expect(await domain.isBroadcasting()).toBeFalsy();
    await domain.begin("Tetris"); await wait();
    expect(await domain.isBroadcasting()).toBeTruthy();
    expect(await domain.getBroadcastNumber()).toBe(1);
    expect(await domain.getGame()).toBe("Tetris");
    await domain.end(); await wait();
    expect(await domain.isBroadcasting()).toBeFalsy();
    await domain.begin("Zelda"); await wait();
    expect(await domain.isBroadcasting()).toBeTruthy();
    expect(await domain.getBroadcastNumber()).toBe(2);
    expect(await domain.getGame()).toBe("Zelda");
  });
});

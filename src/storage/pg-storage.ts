import { EventStorage, KeyValueStorage, ValueStorage } from "es-objects";
import { Pool } from "pg";
import { PgEventStorage } from "./pg-event-storage";
import { PgKeyValueStorage } from "./pg-key-value-storage";
import { PgValueStorage } from "./pg-value-storage";

export class PgStorage {
  private eventStorage: EventStorage;

  constructor(private db: Pool) {
    this.eventStorage = new PgEventStorage(this.db);
  }

  public getEventStorage(): EventStorage {
    return this.eventStorage;
  }

  public getValueStorage<T>(name: string): ValueStorage<T> {
    return new PgValueStorage(name, this.db);
  }

  public getKeyValueStorage<T>(name: string): KeyValueStorage<T> {
    return new PgKeyValueStorage(name, this.db);
  }
}

import { EventStorage, KeyValueStorage, ValueStorage } from "es-objects";
import { Pool } from "pg";
import { PgEventStorage } from "./pg-event-storage";
import { Storage, ViewerStorage } from "./storage";

export class PgStorage implements Storage {
  private db: Pool;
  private eventStorage: EventStorage;

  constructor(dbUrl: string) {
    this.db = new Pool({ connectionString: dbUrl });
    this.eventStorage = new PgEventStorage(this.db);
  }

  public getEventStorage(): EventStorage {
    return this.eventStorage;
  }

  public getValueStorage(name: string): ValueStorage<any> {

  }

  public getKeyValueStorage(name: string): KeyValueStorage<any> {

  }

  public getViewerStorage(): ViewerStorage {

  }
}

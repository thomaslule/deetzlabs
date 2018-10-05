import { EventStorage, KeyValueStorage, ValueStorage } from "es-objects";
import { Pool } from "pg";
import { Storage, ViewerStorage } from "./storage";

export class PgStorage implements Storage {
  private db: Pool;

  constructor(dbUrl: string) {
    this.db = new Pool({ connectionString: dbUrl });
  }

  public getEventStorage(): EventStorage {

  }

  public getValueStorage(name: string): ValueStorage<any> {

  }

  public getKeyValueStorage(name: string): KeyValueStorage<any> {

  }

  public getViewerStorage(): ViewerStorage {

  }
}

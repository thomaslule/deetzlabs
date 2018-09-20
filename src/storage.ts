import {
  EventStorage, InMemoryEventStorage, InMemoryKeyValueStorage, InMemoryValueStorage, KeyValueStorage, ValueStorage,
} from "es-objects";
import { Dictionary } from "./util";

export class Storage {
  private eventStorage: EventStorage = new InMemoryEventStorage();
  private valueStorage: Dictionary<ValueStorage<any>> = {};
  private keyValueStorages: Dictionary<KeyValueStorage<any>> = {};

  public getEventStorage(): EventStorage {
    return this.eventStorage;
  }

  public getValueStorage(id: string): ValueStorage<any> {
    if (!this.valueStorage[id]) {
      this.valueStorage[id] = new InMemoryValueStorage();
    }
    return this.valueStorage[id];

  }

  public getKeyValueStorage(id: string): KeyValueStorage<any> {
    if (!this.keyValueStorages[id]) {
      this.keyValueStorages[id] = new InMemoryKeyValueStorage();
    }
    return this.keyValueStorages[id];
  }
}

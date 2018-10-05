import {
  EventStorage, InMemoryEventStorage, InMemoryKeyValueStorage, InMemoryValueStorage, KeyValueStorage, ValueStorage,
} from "es-objects";
import { Storage, ViewerState } from "../src/storage/storage";
import { Dictionary } from "../src/util";

export class InMemoryStorage implements Storage {
  private eventStorage: EventStorage = new InMemoryEventStorage();
  private valueStorage: Dictionary<ValueStorage<any>> = {};
  private keyValueStorages: Dictionary<KeyValueStorage<any>> = {};
  private viewerStorage = new InMemoryViewerStorage();

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

  public getViewerStorage() {
    return this.viewerStorage;
  }
}

export class InMemoryViewerStorage {
  constructor(private viewers: Dictionary<ViewerState> = {}) {
  }

  public async get(id: string) {
    return this.viewers[id];
  }

  public async setName(id: string, name: string) {
    const viewer = this.getOrInit(id);
    this.viewers = {
      ...this.viewers,
      [id]: { ...viewer, name },
    };
  }

  public async setAchievements(id: string, achievements: string[]) {
    const viewer = this.getOrInit(id);
    this.viewers = {
      ...this.viewers,
      [id]: { ...viewer, achievements },
    };
  }

  public async getAll() {
    return (Object as any).values(this.viewers);
  }

  private getOrInit(id: string) {
    return this.viewers[id] || { id, name: undefined, achievements: [] };
  }
}

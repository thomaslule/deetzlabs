import { EventStorage, KeyValueStorage, ValueStorage } from "es-objects";

export interface Storage {
  getEventStorage(): EventStorage;
  getValueStorage(id: string): ValueStorage<any>;
  getKeyValueStorage(id: string): KeyValueStorage<any>;
  getViewerStorage(): ViewerStorage;
}

export interface ViewerStorage {
  get(id: string): Promise<ViewerState | undefined>;
  getAll(): Promise<ViewerState[]>;
  setName(id: string, name: string): Promise<void>;
  setAchievements(id: string, achievements: string[]): Promise<void>;
}

export interface ViewerState {
  id: string;
  name: string;
  achievements: string [];
}

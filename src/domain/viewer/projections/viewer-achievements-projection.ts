import { Event, KeyValueStorage, Reducer, StoredEntityProjection } from "es-objects";

const reducer: Reducer<string[]> = (state = [], event) => {
  return event.type === "got-achievement" ? state.concat(event.achievement) : state;
};

export class ViewerAchievementsProjection {
  private stored: StoredEntityProjection<string[]>;

  constructor(storage: KeyValueStorage<any>) {
    this.stored = new StoredEntityProjection<string[]>(reducer, storage, (event) => event.aggregate === "viewer");
  }

  public async get(id: string): Promise<string[]> {
    return this.stored.getState(id);
  }

  public async handleEvent(event: Event) {
    try {
      await this.stored.handleEvent(event);
    } catch (err) {
      // TODO
    }
  }
}

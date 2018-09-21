import { Event, KeyValueStorage, Reducer, StoredEntityProjection } from "es-objects";

const reducer: Reducer<string> = (state = undefined, event) => {
  if (event.type === "sent-chat-message" && event.displayName) {
    return event.displayName;
  }
  return state;
};

export class DisplayNameProjection {
  private stored: StoredEntityProjection<string>;

  constructor(storage: KeyValueStorage<any>) {
    this.stored = new StoredEntityProjection<string>(reducer, storage, (event) => event.aggregate === "viewer");
  }

  public async get(id: string) {
    const displayName = await this.stored.getState(id);
    return displayName || id;
  }

  public async handleEvent(event: Event) {
    try {
      await this.stored.handleEvent(event);
    } catch (err) {
      // TODO
    }
  }
}

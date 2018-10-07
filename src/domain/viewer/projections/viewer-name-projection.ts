import { Event, KeyValueStorage, PersistedEntityReduceProjection, Reducer } from "es-objects";

const reducer: Reducer<string> = (state = undefined, event) => {
  if (event.type === "changed-name") {
    return event.name;
  }
  return state;
};

const durationOfWaitForRetry = 10;

export class ViewerNameProjection {
  private stored: PersistedEntityReduceProjection<string>;

  constructor(storage: KeyValueStorage<any>) {
    this.stored = new PersistedEntityReduceProjection(reducer, storage, (event) => event.aggregate === "viewer");
  }

  public async get(id: string) {
    let stored = await this.stored.getState(id);
    if (stored === undefined) {
      // if we don't know the name, its probably a brand new viewer
      // the event that led to this get() is probably currently feeding this proj
      // on second try, we have good chances to get their name
      await new Promise((resolve) => setTimeout(resolve, durationOfWaitForRetry));
      stored = await this.stored.getState(id);
    }
    return stored;
  }

  public async handleEvent(event: Event) {
    await this.stored.handleEvent(event);
  }

  public getRebuilder() {
    return this.stored.getRebuilder();
  }
}

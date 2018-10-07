import { Event, PersistedReduceProjection, Reducer, ValueStorage } from "es-objects";
import { Dictionary } from "../../../util";

const reducer: Reducer<Dictionary<string>> = (state = {}, event) => {
  return event.type === "changed-name"
    ? { ...state, [event.id]: event.name }
    : state;
};

export class NamesProjection {
  private stored: PersistedReduceProjection<Dictionary<string>>;

  constructor(storage: ValueStorage<any>) {
    this.stored = new PersistedReduceProjection<Dictionary<string>>(
      reducer, storage, (event) => event.aggregate === "viewer",
    );
  }

  public async get(): Promise<Dictionary<string>> {
    return this.stored.getState();
  }

  public async handleEvent(event: Event) {
    await this.stored.handleEvent(event);
  }

  public getRebuilder() {
    return this.stored.getRebuilder();
  }
}

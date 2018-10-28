import { Event, KeyValueStorage, Rebuildable } from "es-objects";
import { Readable } from "stream";
import { consumeStream } from "../../../util";

export class ViewerProjection implements Rebuildable {
  constructor(private storage: KeyValueStorage<ViewerState>) {
  }

  public async handleEvent(event: Event) {
    if (event.aggregate === "viewer") {
      if (event.type === "changed-name") {
        const state = await this.getStateImmediate(event.id);
        await this.storage.store(event.id, { ...state, name: event.name });
      }
      if (event.type === "got-achievement") {
        const state = await this.getStateImmediate(event.id);
        await this.storage.store(event.id, { ...state, achievements: state.achievements.concat(event.achievement) });
      }
    }
  }

  public async getState(id: string) {
    let stored = await this.getStateImmediate(id);
    if (stored.name === undefined) {
      // if we don't know the viewer name, they are probably new to the system
      // the event that led to this get() is probably currently feeding this proj
      // on second try, we have good chances to get it
      await new Promise((resolve) => setTimeout(resolve, 100));
      stored = await this.getStateImmediate(id);
    }
    return stored;
  }

  public async getAll() {
    return this.storage.getAll();
  }

  public async rebuild(events: Readable) {
    await consumeStream(events, (event) => this.handleEvent(event));
  }

  private async getStateImmediate(id: string): Promise<ViewerState> {
    const state = await this.storage.get(id);
    if (state === undefined) {
      return { name: undefined, achievements: [] };
    }
    return state;
  }
}

export interface ViewerState {
  name: string | undefined;
  achievements: string [];
}

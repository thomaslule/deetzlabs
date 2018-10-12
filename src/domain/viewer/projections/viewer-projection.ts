import { Event, KeyValueStorage, PersistedEntityReduceProjection } from "es-objects";

export class ViewerProjection extends PersistedEntityReduceProjection<ViewerState> {
  constructor(storage: KeyValueStorage<ViewerState>) {
    super(viewerReducer, storage, (event) => event.aggregate === "viewer");
  }

  public async getState(id: string) {
    let stored = await super.getState(id);
    if (stored.name === undefined) {
      // if we don't know the viewer name, they are probably new to the system
      // the event that led to this get() is probably currently feeding this proj
      // on second try, we have good chances to get it
      await new Promise((resolve) => setTimeout(resolve, 100));
      stored = await super.getState(id);
    }
    return stored;
  }
}

export interface ViewerState {
  name: string | undefined;
  achievements: string [];
}

function viewerReducer(state: ViewerState = { name: undefined, achievements: [] }, event: Event) {
  if (event.type === "changed-name") {
    return { ...state, name: event.name };
  }
  if (event.type === "got-achievement") {
    return { ...state, achievements: state.achievements.concat(event.achievement) };
  }
  return state;
}

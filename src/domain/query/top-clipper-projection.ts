import { Event, PersistedReduceProjection, ValueStorage } from "es-objects";

export class TopClipperProjection extends PersistedReduceProjection<
  string | undefined
> {
  constructor(storage: ValueStorage<string | undefined>) {
    super(reducer, storage, event => event.aggregate === "viewer");
  }
}

function reducer(state: string | undefined, event: Event) {
  if (event.type === "became-top-clipper") {
    return event.id;
  }
  return state;
}

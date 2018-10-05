import { Event, StoredProjection, ValueStorage } from "es-objects";

export class BroadcastProjection {
  private projection: StoredProjection<State>;

  constructor(storage: ValueStorage<any>) {
    this.projection = new StoredProjection(reducer, storage, (e) => e.aggregate === "broadcast");
  }

  public async handleEvent(event: Event) {
    await this.projection.handleEvent(event);
  }

  public async isBroadcasting() {
    return (await this.projection.getState()).isBroadcasting;
  }

  public async getBroadcastNumber() {
    return (await this.projection.getState()).number;
  }

  public async getGame() {
    return (await this.projection.getState()).game;
  }
}

interface State {
  number: number;
  isBroadcasting: boolean;
  game: string;
}

function reducer(state: State = { number: 0, isBroadcasting: false, game: "" }, event: Event): State {
  if (event.type === "begun") {
    return {
      number: state.number + 1,
      isBroadcasting: true,
      game: event.game,
    };
  }
  if (event.type === "changed-game") {
    return {
      ...state,
      game: event.game,
    };
  }
  if (event.type === "ended") {
    return {
      ...state,
      isBroadcasting: false,
    };
  }
  return state;
}

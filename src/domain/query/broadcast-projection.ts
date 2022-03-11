import { Event, InMemoryReduceProjection } from "es-objects";

export class BroadcastProjection extends InMemoryReduceProjection<State> {
  constructor() {
    super(reducer);
  }

  public isBroadcasting(): boolean {
    return this.getState().isBroadcasting;
  }

  public getBroadcastNumber(): number | undefined {
    return this.getState().isBroadcasting ? this.getState().number : undefined;
  }

  public getGame(): string {
    return this.getState().game;
  }
}

interface State {
  number: number;
  isBroadcasting: boolean;
  game: string;
}

function reducer(
  state: State = { number: 0, isBroadcasting: false, game: "" },
  event: Event
): State {
  if (event.aggregate !== "broadcast") {
    return state;
  }
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

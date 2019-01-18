import { DecisionSequence, Entity, Event } from "es-objects";
import ow from "ow";
import { begun, changedGame, ended } from "./events";

export class Broadcast extends Entity<DecisionState> {
  constructor(
    decisionSequence: DecisionSequence<DecisionState>,
    publish: (
      event: Event,
      decisionSequence: DecisionSequence<DecisionState>
    ) => Promise<void>
  ) {
    super("broadcast", decisionSequence, publish);
  }

  public async begin(game: string) {
    ow(game, ow.string.minLength(1));
    if (this.isBroadcasting()) {
      throw new Error("cant begin broadcast, broadcast already live");
    }
    await this.publishAndApply(begun(game));
  }

  public async changeGame(game: string) {
    ow(game, ow.string.minLength(1));
    if (!this.isBroadcasting()) {
      throw new Error("cant change game, broadcast not live");
    }
    if (this.getCurrentGame() === game) {
      throw new Error(`cant change game to ${game}, already broadcasting it`);
    }
    await this.publishAndApply(changedGame(game));
  }

  public async end() {
    if (!this.isBroadcasting()) {
      throw new Error("cant end broadcast, broadcast not live");
    }
    await this.publishAndApply(ended());
  }

  public isBroadcasting() {
    return this.getDecision().broadcasting;
  }

  public getCurrentGame() {
    return this.getDecision().game;
  }

  protected getAggregate() {
    return "broadcast";
  }

  protected getDecisionReducer() {
    return decisionReducer;
  }
}

interface DecisionState {
  broadcasting: boolean;
  game: string | undefined;
}

export function decisionReducer(
  state: DecisionState = { broadcasting: false, game: undefined },
  event: Event
): DecisionState {
  if (event.type === "begun") {
    return { broadcasting: true, game: event.game };
  } else if (event.type === "changedGame") {
    return { ...state, game: event.game };
  } else if (event.type === "ended") {
    return { broadcasting: false, game: undefined };
  }
  return state;
}

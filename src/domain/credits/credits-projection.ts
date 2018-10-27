import { Event, PersistedReduceProjection, ValueStorage } from "es-objects";

export class CreditsProjection extends PersistedReduceProjection<Credits> {
  constructor(storage: ValueStorage<Credits>) {
    super(reducer, storage);
  }
}

export interface Credits {
  games: string[];
  viewers: string[];
  hosts: string[];
  achievements: Array<{viewer: string, achievement: string}>;
  subscribes: string[];
  donators: string[];
  follows: string[];
}

function emptyCredits(game: string): Credits {
  return {
    games: [game],
    viewers: [],
    hosts: [],
    achievements: [],
    subscribes: [],
    donators: [],
    follows: [],
  };
}

function addItem(state: any, type: string, item: string) {
  if (state[type].includes(item)) {
    return state;
  }
  return { ...state, [type]: state[type].concat(item) };
}

function reducer(state = emptyCredits(""), event: Event): Credits {
  if (event.aggregate === "broadcast") {
    if (event.type === "begun") {
      return emptyCredits(event.game);
    }
    if (event.type === "changed-game") {
      return addItem(state, "games", event.game);
    }
  }
  if (event.aggregate === "viewer") {
    if (event.type === "sent-chat-message") {
      return addItem(state, "viewers", event.id);
    }
    if (event.type === "hosted" || event.type === "raided") {
      return addItem(state, "hosts", event.id);
    }
    if (event.type === "got-achievement") {
      return {
        ...state,
        achievements: state.achievements.concat({
          viewer: event.id,
          achievement: event.achievement,
        }),
      };
    }
    if (event.type === "subscribed" || event.type === "resubscribed") {
      return addItem(state, "subscribes", event.id);
    }
    if (event.type === "gave-sub") {
      const intermediateState = addItem(state, "subscribes", event.recipient);
      return addItem(intermediateState, "donators", event.id);
    }
    if (event.type === "cheered") {
      return addItem(state, "donators", event.id);
    }
    if (event.type === "donated") {
      return addItem(state, "donators", event.id);
    }
    if (event.type === "followed") {
      return addItem(state, "follows", event.id);
    }
  }
  return state;
}

import { Event, PersistedReduceProjection, ValueStorage } from "es-objects";
import { Options } from "../../get-options";

export class Credits extends PersistedReduceProjection<CreditsState> {
  constructor(storage: ValueStorage<CreditsState>, private options: Options) {
    super(reducer, storage);
  }

  public async getWithNames(getDisplayName: (id: string) => string) {
    const state = await this.getState();
    return {
      games: state.games,
      viewers: state.viewers.map(getDisplayName),
      hosts: state.hosts.map(getDisplayName),
      subscribes: state.subscribes.map(getDisplayName),
      donators: state.donators.map(getDisplayName),
      follows: state.follows.map(getDisplayName),
      achievements: state.achievements.map((a) => ({
        viewer: getDisplayName(a.viewer),
        achievement: this.options.achievements[a.achievement].name,
      })),
    };
  }
}

interface CreditsState {
  games: string[];
  viewers: string[];
  hosts: string[];
  achievements: Array<{viewer: string, achievement: string}>;
  subscribes: string[];
  donators: string[];
  follows: string[];
}

function emptyCredits(game: string): CreditsState {
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

function reducer(state = emptyCredits(""), event: Event): CreditsState {
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

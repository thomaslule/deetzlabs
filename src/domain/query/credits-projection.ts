import { Event, PersistedReduceProjection, ValueStorage } from "es-objects";
import { Options } from "../../options";
import { PgViewer, PgViewerStorage } from "../../storage/pg-viewer-storage";

export class CreditsProjection extends PersistedReduceProjection<Credits> {
  constructor(storage: ValueStorage<Credits>, private options: Options) {
    super(reducer, storage);
  }

  public async getWithNames(viewerStorage: PgViewerStorage): Promise<Credits> {
    const credits = await this.getState();
    const viewerIds = [
      ...credits.viewers,
      ...credits.hosts,
      ...credits.achievements.map((a) => a.viewer),
      ...credits.donators,
      ...credits.follows,
    ];
    const viewers = await viewerStorage.getMany(viewerIds);
    const getViewerName = (id: string) => (viewers.find((v) => v.id === id) as PgViewer).name;
    return {
      games: credits.games,
      viewers: credits.viewers.map(getViewerName),
      hosts: credits.hosts.map(getViewerName),
      subscribes: credits.subscribes.map(getViewerName),
      donators: credits.donators.map(getViewerName),
      follows: credits.follows.map(getViewerName),
      achievements: credits.achievements.map((a) => ({
        viewer: getViewerName(a.viewer),
        achievement: this.options.achievements[a.achievement].name,
      })),
    };
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

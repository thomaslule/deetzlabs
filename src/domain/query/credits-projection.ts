import { Event, PersistedReduceProjection, ValueStorage } from "es-objects";
import { log } from "../../log";
import { Options } from "../../options";
import { PgViewerStorage } from "../../storage/pg-viewer-storage";

export class CreditsProjection extends PersistedReduceProjection<Credits> {
  constructor(storage: ValueStorage<Credits>, private options: Options) {
    super(reducer, storage);
  }

  public async getWithNames(viewerStorage: PgViewerStorage): Promise<Credits> {
    const credits = await this.getState();
    const viewerIds = Array.from(
      new Set([
        ...credits.viewers,
        ...credits.hosts,
        ...credits.donators,
        ...credits.follows,
        ...credits.achievements.map((a) => a.viewer),
      ])
    );
    const viewers = await viewerStorage.getMany(viewerIds);
    function getViewer(id: string) {
      const viewer = viewers.find((viewer) => viewer.id === id);
      if (viewer === undefined) {
        log.error(`couldnt find name of ${id}`);
        return undefined;
      }
      return viewer.banned ? undefined : viewer;
    }
    function getViewerNames(viewerIds: string[]): string[] {
      return viewerIds
        .map((id) => getViewer(id))
        .map((viewer) => (viewer === undefined ? undefined : viewer.name))
        .filter((name) => name !== undefined) as string[];
    }
    return {
      games: credits.games,
      viewers: getViewerNames(credits.viewers),
      hosts: getViewerNames(credits.hosts),
      subscribes: getViewerNames(credits.subscribes),
      donators: getViewerNames(credits.donators),
      follows: getViewerNames(credits.follows),
      achievements: credits.achievements
        .map((a) => {
          const viewer = getViewer(a.viewer);
          return viewer === undefined
            ? undefined
            : {
                viewer: viewer.name,
                achievement: this.options.achievements[a.achievement].name,
              };
        })
        .filter((a) => a !== undefined) as CreditsAchievement[],
    };
  }
}

export interface Credits {
  games: string[];
  viewers: string[];
  hosts: string[];
  achievements: CreditsAchievement[];
  subscribes: string[];
  donators: string[];
  follows: string[];
}

export interface CreditsAchievement {
  viewer: string;
  achievement: string;
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
    if (event.type === "subscribed") {
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

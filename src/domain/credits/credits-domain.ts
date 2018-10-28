import { EventBus } from "es-objects";
import { Readable } from "stream";
import { Options } from "../../get-options";
import { PgStorage } from "../../storage/pg-storage";
import { ViewerDomain } from "../viewer/viewer-domain";
import { Credits, CreditsProjection } from "./credits-projection";

export class CreditsDomain {
  private projection: CreditsProjection;

  constructor(bus: EventBus, storage: PgStorage, private viewerDomain: ViewerDomain, private options: Options) {
    this.projection = new CreditsProjection(storage.getValueStorage("credits"));
    bus.onEvent((event) => this.projection.handleEvent(event));
  }

  public async get(): Promise<Credits> {
    const state = await this.projection.getState();
    const viewers = await this.viewerDomain.getAllViewersState();
    const getViewerName = (id: string) => {
      const viewer = viewers[id];
      if (viewer !== undefined) { return viewer.name || ""; } else { return ""; }
    };
    return {
      games: state.games,
      viewers: state.viewers.map(getViewerName),
      hosts: state.hosts.map(getViewerName),
      subscribes: state.subscribes.map(getViewerName),
      donators: state.donators.map(getViewerName),
      follows: state.follows.map(getViewerName),
      achievements: state.achievements.map((a) => ({
        viewer: getViewerName(a.viewer),
        achievement: this.options.achievements[a.achievement].name,
      })),
    };
  }

  public async rebuild(events: Readable) {
    await this.projection.rebuild(events);
  }
}

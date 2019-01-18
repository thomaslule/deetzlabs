import { EventBus } from "es-objects";
import { Options } from "../../options";
import { PgStorage } from "../../storage/pg-storage";
import { BroadcastProjection } from "./broadcast-projection";
import { CreditsProjection } from "./credits-projection";
import { SettingsProjection } from "./settings-projection";
import { TopClipperProjection } from "./top-clipper-projection";
import { ViewerProjection } from "./viewer-projection";

export class Query {
  private broadcast: BroadcastProjection;
  private credits: CreditsProjection;
  private settings: SettingsProjection;
  private topClipper: TopClipperProjection;
  private viewers: ViewerProjection;

  constructor(private storage: PgStorage, bus: EventBus, options: Options) {
    this.broadcast = new BroadcastProjection();
    bus.onEvent(event => this.broadcast.handleEvent(event));

    this.credits = new CreditsProjection(
      this.storage.getValueStorage("credits"),
      options
    );
    bus.onEvent(event => this.credits.handleEvent(event));

    this.settings = new SettingsProjection(
      this.storage.getValueStorage("settings")
    );
    bus.onEvent(event => this.settings.handleEvent(event));

    this.topClipper = new TopClipperProjection(
      this.storage.getValueStorage("top-clipper")
    );
    bus.onEvent(event => this.topClipper.handleEvent(event));

    this.viewers = new ViewerProjection(this.storage.getViewerStorage());
    bus.onEvent(event => this.viewers.handleEvent(event));
  }

  public rebuildMemoryStream() {
    return this.broadcast.rebuildStream();
  }

  public rebuildStreams() {
    return [
      this.broadcast.rebuildStream(),
      this.credits.rebuildStream(),
      this.settings.rebuildStream(),
      this.topClipper.rebuildStream(),
      this.viewers.rebuildStream()
    ];
  }

  public isBroadcasting() {
    return this.broadcast.isBroadcasting();
  }

  public getBroadcastNumber() {
    return this.broadcast.getBroadcastNumber();
  }

  public getBroadcastedGame() {
    return this.broadcast.getGame();
  }

  public async getCredits() {
    return this.credits.getWithNames(this.storage.getViewerStorage());
  }

  public async getSettings() {
    return this.settings.getState();
  }

  public async getTopClipper() {
    return this.topClipper.getState();
  }

  public async getViewer(id: string) {
    return this.storage.getViewerStorage().get(id);
  }

  public async getViewerWithAchievements(id: string) {
    return this.storage.getViewerStorage().getWithAchievements(id);
  }

  public async getRecentViewerNames() {
    return this.storage.getViewerStorage().getRecentNames();
  }

  public async getAllViewerAchievements() {
    return this.storage.getViewerStorage().getAllAchievements();
  }

  public async getLastViewerAchievements() {
    return this.storage.getViewerStorage().getLastAchievements(5);
  }
}

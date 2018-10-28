import { EventBus } from "es-objects";
import { PassThrough } from "stream";
import { Options } from "../get-options";
import { log } from "../log";
import { PgStorage } from "../storage/pg-storage";
import { BroadcastDomain } from "./broadcast/broadcast-domain";
import { CreditsDomain } from "./credits/credits-domain";
import { SettingsDomain } from "./settings/settings-domain";
import { ViewerDomain } from "./viewer/viewer-domain";

export class Domain {
  public viewer: ViewerDomain;
  public broadcast: BroadcastDomain;
  public settings: SettingsDomain;
  public credits: CreditsDomain;

  constructor(
    private storage: PgStorage,
    sendChatMessage: (msg: string) => void,
    showAchievement: (achievement: string, username: string, text: string, volume: number) => void,
    options: Options,
  ) {
    const bus = new EventBus(this.storage.getEventStorage(), (err) => {
      log.error("An error happened in an event handler: %s", err);
      if (err.stack) {
        log.error(err.stack);
      }
    });
    this.viewer = new ViewerDomain(bus, sendChatMessage, this.storage, options);
    this.broadcast = new BroadcastDomain(bus, this.storage);
    this.settings = new SettingsDomain(bus, this.storage);
    this.credits = new CreditsDomain(bus, this.storage, this.viewer, options);

    bus.onEvent((event) => {
      log.info(`event happened: %s %s %s`, event.aggregate, event.id, event.type);
    });
    bus.onEvent(async (event) => {
      try {
        if (event.aggregate === "viewer" &&
          (event.type === "got-achievement" || event.type === "replayed-achievement")) {
          const achievement = options.achievements[event.achievement];
          const displayName = await this.viewer.getViewerName(event.id);
          const volume = await this.settings.getAchievementVolume();
          await showAchievement(achievement.name, displayName as string, achievement.text, volume);
        }
      } catch (err) {
        log.error(err);
      }
    });
  }

  public async init() {
    const events = this.storage.getEventStorage().getEvents("broadcast", "broadcast");
    await this.broadcast.initCache(events);
  }

  public async rebuild() {
    // TODO need to change rebuild methods to make it work better
    const events = this.storage.getEventStorage().getEvents();
    const passthrough = new PassThrough({ objectMode: true });
    const rebuild = Promise.all([
      this.broadcast.rebuild(passthrough),
      this.credits.rebuild(passthrough),
      this.settings.rebuild(passthrough),
      this.viewer.rebuild(passthrough),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    events.pipe(passthrough);
    await rebuild;
  }
}

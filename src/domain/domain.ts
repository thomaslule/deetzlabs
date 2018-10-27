import { EventBus } from "es-objects";
import { Options } from "../get-options";
import { log } from "../log";
import { PgStorage } from "../storage/pg-storage";
import { BroadcastDomain } from "./broadcast/broadcast-domain";
import { SettingsDomain } from "./settings/settings-domain";
import { ViewerDomain } from "./viewer/viewer-domain";

export class Domain {
  public viewer: ViewerDomain;
  public broadcast: BroadcastDomain;
  public settings: SettingsDomain;

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
}

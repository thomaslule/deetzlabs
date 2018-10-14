import { EventBus } from "es-objects";
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
    storage: PgStorage,
    sendChatMessage: (msg: string) => void,
    showAchievement: (achievement: string) => void,
    options: any,
  ) {
    const bus = new EventBus(storage.getEventStorage(), (err) => {
      log.error("An error happened in an event handler: %s", err);
      if (err.stack) {
        log.error(err.stack);
      }
    });
    this.viewer = new ViewerDomain(bus, sendChatMessage, storage, options);
    this.broadcast = new BroadcastDomain(bus, storage);
    this.settings = new SettingsDomain(bus, storage);
    bus.onEvent((event) => {
      log.info(`event happened: %s %s %s`, event.aggregate, event.id, event.type);
    });
  }
}

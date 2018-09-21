import { EventBus } from "es-objects";
import { log } from "../log";
import { Storage } from "../storage";
import { SettingsDomain } from "./settings/settings-domain";
import { ViewerDomain } from "./viewer/viewer-domain";

export class Domain {
  public viewer: ViewerDomain;
  public settings: SettingsDomain;

  constructor(
    storage: Storage,
    sendChatMessage: (msg: string) => void,
    showAchievement: (achievement: string) => void,
    options: any,
  ) {
    const bus = new EventBus(storage.getEventStorage(), (err) => {
      log.error("An error happened in an event handler: %s", err);
    });
    this.viewer = new ViewerDomain(bus, sendChatMessage, storage, options);
    this.settings = new SettingsDomain(
      bus,
      storage.getValueStorage("achievement-volume-proj"),
      storage.getValueStorage("followers-goal-proj"),
    );
    bus.onEvent((event) => {
      log.info(`event happened: %s %s %s`, event.aggregate, event.id, event.type);
    });
  }
}

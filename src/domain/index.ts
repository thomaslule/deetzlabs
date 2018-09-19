import { EventBus } from "es-objects";
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
    const bus = new EventBus(storage.getEventStorage());
    this.viewer = new ViewerDomain(bus, sendChatMessage, storage.getKeyValueStorage("viewer-decision"), options);
    this.settings = new SettingsDomain(
      bus,
      storage.getValueStorage("achievement-volume-proj"),
      storage.getValueStorage("followers-goal-proj"),
    );
  }
}

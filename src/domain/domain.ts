import { EventBus } from "es-objects";
import { Options } from "../get-options";
import { log } from "../log";
import { PgStorage } from "../storage/pg-storage";
import { Broadcast } from "./broadcast/broadcast";
import { BroadcastDomain } from "./broadcast/broadcast-domain";
import { commandsListener } from "./commands-listener";
import { displayAchievementListener } from "./display-achievement-listener";
import { Query } from "./query/query";
import { Settings } from "./settings/settings";
import { SettingsDomain } from "./settings/settings-domain";
import { Viewer } from "./viewer/viewer";
import { ViewerDomain } from "./viewer/viewer-domain";

export class Domain {
  public query: Query;
  public store: {
    getBroadcast(): Promise<Broadcast>;
    getSettings(): Promise<Settings>;
    getViewer(id: string): Promise<Viewer>;
  };
  public service: {
    setTopClipper(id: string): Promise<void>;
  };
  private broadcast: BroadcastDomain;
  private viewer: ViewerDomain;

  constructor(
    private storage: PgStorage,
    sendChatMessage: (msg: string) => void,
    showAchievement: (achievement: string, username: string, text: string, volume: number) => void,
    options: Options,
  ) {
    const bus = new EventBus(this.storage.getEventStorage());
    bus.on("error", (err) => {
      log.error("An error happened in an event handler: %s", err);
      if (err.stack) {
        log.error(err.stack);
      }
    });
    const broadcast = this.broadcast = new BroadcastDomain(bus, this.storage);
    const settings = new SettingsDomain(bus, this.storage.getEventStorage());
    const viewer = this.viewer = new ViewerDomain(bus, this.storage, options);

    const query = this.query = new Query(this.storage, bus, options);
    this.store = {
      getBroadcast() { return broadcast.get(); },
      getSettings() { return settings.get(); },
      getViewer(id) { return viewer.get(id); },
    };
    this.service = {
      async setTopClipper(id) { await viewer.setTopClipper(id, query); },
    };

    bus.onEvent((event) => {
      log.info(`event happened: %s %s %s`, event.aggregate, event.id, event.type);
    });
    bus.onEvent(commandsListener(this.query, sendChatMessage, options));
    bus.onEvent(displayAchievementListener(this.query, showAchievement, options));
  }

  public async init() {
    return new Promise((resolve, reject) => {
      const events = this.storage.getEventStorage().getEvents("broadcast", "broadcast");
      const stream = this.query.rebuildMemoryStream();
      events.pipe(stream);
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
  }

  public async rebuild() {
    const rebuildStreams = [
      this.broadcast.decisionRebuildStream(),
      this.viewer.decisionRebuildStream(),
      ...this.query.rebuildStreams(),
    ];
    const events = this.storage.getEventStorage().getEvents();
    events.setMaxListeners(Infinity);
    await Promise.all(
      rebuildStreams.map((stream) => new Promise((resolve, reject) => {
        events.pipe(stream);
        stream.on("finish", resolve);
        stream.on("error", reject);
      })),
    );
  }

}

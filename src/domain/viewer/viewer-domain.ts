import { EventBus,  PersistedDecisionProvider, Store } from "es-objects";
import { Readable } from "stream";
import { PgStorage } from "../../storage/pg-storage";
import { AchievementsCommandListenener } from "./listeners/achievements-command-listener";
import { CommandsCommandListenener } from "./listeners/commands-command-listener";
import { LastAchievementsProjection } from "./projections/last-achievements-projection";
import { TopClipperProjection } from "./projections/top-clipper-projection";
import { ViewerProjection } from "./projections/viewer-projection";
import { DecisionState, getDecisionReducer, Viewer } from "./viewer";

export class ViewerDomain {
  private store: Store<Viewer, DecisionState>;
  private viewerDecisionProvider: PersistedDecisionProvider<any>;
  private viewerProj: ViewerProjection;
  private lastAchievementsProj: LastAchievementsProjection;
  private topClipperProj: TopClipperProjection;

  constructor(
    eventBus: EventBus,
    sendChatMessage: (msg: string) => void,
    storage: PgStorage,
    options: any,
  ) {
    this.viewerDecisionProvider = new PersistedDecisionProvider(
      "viewer",
      getDecisionReducer(options),
      storage.getKeyValueStorage("viewer-decision"),
    );
    this.store = new Store<Viewer, DecisionState>(
      "viewer",
      (id, decisionState, createAndPublish) => new Viewer(id, decisionState, createAndPublish, options),
      this.viewerDecisionProvider,
      (event) => eventBus.publish(event),
    );

    this.viewerProj = new ViewerProjection(storage.getKeyValueStorage("viewer-state"));
    eventBus.onEvent((event) => this.viewerProj.handleEvent(event));

    this.lastAchievementsProj = new LastAchievementsProjection(
      storage.getValueStorage("viewer-recent-achievements"));
    eventBus.onEvent((event) => this.lastAchievementsProj.handleEvent(event));

    this.topClipperProj = new TopClipperProjection(storage.getValueStorage("viewer-top-clipper"));
    eventBus.onEvent((event) => this.topClipperProj.handleEvent(event));

    const commandsCmdListener = new CommandsCommandListenener(sendChatMessage, options);
    eventBus.onEvent((event) => commandsCmdListener.handleEvent(event));

    const achsCmdListener = new AchievementsCommandListenener(
      this.viewerProj,
      sendChatMessage,
      options,
    );
    eventBus.onEvent((event) => achsCmdListener.handleEvent(event));
  }

  public async topClipper(id: string) {
    const previous = await this.topClipperProj.getState();
    if (previous !== id) {
      if (previous !== undefined) {
        await (await this.get(previous)).notTopClipper();
      }
      await (await this.get(id)).topClipper();
    }
  }

  public async get(id: string) {
    return this.store.get(id);
  }

  public async getViewerName(id: string) {
    return (await this.viewerProj.getState(id)).name;
  }

  public async getAllViewersState() {
    return this.viewerProj.getAll();
  }

  public async getLastAchievements() {
    return this.lastAchievementsProj.getWithNames(this.viewerProj);
  }

  public async rebuild(events: Readable) {
    await Promise.all([
      this.viewerDecisionProvider.rebuild(events),
      this.viewerProj.rebuild(events),
      this.lastAchievementsProj.rebuild(events),
      this.topClipperProj.rebuild(events),
    ]);
  }
}

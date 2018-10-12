import { EventBus,  PersistedDecisionProvider, Store } from "es-objects";
import { PgStorage } from "../../storage/pg-storage";
import { AchievementsCommandListenener } from "./listeners/achievements-command-listener";
import { CommandsCommandListenener } from "./listeners/commands-command-listener";
import { LastAchievementsProjection } from "./projections/last-achievements-projection";
import { ViewerProjection } from "./projections/viewer-projection";
import { DecisionState, getDecisionReducer, Viewer } from "./viewer";

export class ViewerDomain {
  private store: Store<Viewer, DecisionState>;
  private viewerProj: ViewerProjection;
  private lastAchievementsProj: LastAchievementsProjection;

  constructor(
    eventBus: EventBus,
    sendChatMessage: (msg: string) => void,
    storage: PgStorage,
    options: any,
  ) {
    const viewerDecisionProvider = new PersistedDecisionProvider(
      "viewer",
      getDecisionReducer(options),
      storage.getKeyValueStorage("viewer-decision"),
    );
    this.store = new Store<Viewer, DecisionState>(
      "viewer",
      (id, decisionState, createAndPublish) => new Viewer(id, decisionState, createAndPublish, options),
      viewerDecisionProvider,
      (event) => eventBus.publish(event),
    );

    this.viewerProj = new ViewerProjection(storage.getKeyValueStorage("viewer-state"));
    eventBus.onEvent((event) => this.viewerProj.handleEvent(event));

    this.lastAchievementsProj = new LastAchievementsProjection(
      storage.getValueStorage("viewer-recent-achievements"));
    eventBus.onEvent((event) => this.lastAchievementsProj.handleEvent(event));

    const commandsCmdListener = new CommandsCommandListenener(sendChatMessage, options);
    eventBus.onEvent((event) => commandsCmdListener.handleEvent(event));

    const achsCmdListener = new AchievementsCommandListenener(
      this.viewerProj,
      sendChatMessage,
      options,
    );
    eventBus.onEvent((event) => achsCmdListener.handleEvent(event));
  }

  public async get(id: string) {
    return this.store.get(id);
  }

  public async getAllViewersState() {
    return this.viewerProj.getAll();
  }

  public async getLastAchievements() {
    return this.lastAchievementsProj.getWithNames(this.viewerProj);
  }
}

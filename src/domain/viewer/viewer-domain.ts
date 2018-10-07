import { EventBus, PersistedDecisionProvider, Store } from "es-objects";
import { Storage } from "../../storage/storage";
import { AchievementsCommandListenener } from "./listeners/achievements-command-listener";
import { CommandsCommandListenener } from "./listeners/commands-command-listener";
import { ViewersProjection } from "./projections/viewers-projection";
import { DecisionState, getDecisionReducer, Viewer } from "./viewer";

export class ViewerDomain {
  private store: Store<Viewer, DecisionState>;
  private viewersProj: ViewersProjection;

  constructor(
    eventBus: EventBus,
    sendChatMessage: (msg: string) => void,
    storage: Storage,
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

    this.viewersProj = new ViewersProjection(storage.getViewerStorage());
    eventBus.onEvent((event) => this.viewersProj.handleEvent(event));

    const commandsCmdListener = new CommandsCommandListenener(sendChatMessage, options);
    eventBus.onEvent((event) => commandsCmdListener.handleEvent(event));

    const achsCmdListener = new AchievementsCommandListenener(
      this.viewersProj,
      sendChatMessage,
      options,
    );
    eventBus.onEvent((event) => achsCmdListener.handleEvent(event));
  }

  public get(id: string) {
    return this.store.get(id);
  }

  public getAllViewersState() {
    return this.viewersProj.getAll();
  }
}

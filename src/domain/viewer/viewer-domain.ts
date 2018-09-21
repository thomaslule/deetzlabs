import { EventBus, Store, StoredDecisionProvider } from "es-objects";
import { Storage } from "../../storage";
import { AchievementsCommandListenener } from "./listeners/achievements-command-listener";
import { CommandsCommandListenener } from "./listeners/commands-command-listener";
import { DisplayNameProjection } from "./projections/display-name-projection";
import { ViewerAchievementsProjection } from "./projections/viewer-achievements-projection";
import { DecisionState, getDecisionReducer, Viewer } from "./viewer";

export class ViewerDomain {
  private store: Store<Viewer, DecisionState>;
  private viewerAchsProj: ViewerAchievementsProjection;
  private displayNameProj: DisplayNameProjection;

  constructor(
    eventBus: EventBus,
    sendChatMessage: (msg: string) => void,
    storage: Storage,
    options: any,
  ) {
    const viewerDecisionProvider = new StoredDecisionProvider(
      getDecisionReducer(options),
      storage.getKeyValueStorage("viewer-decision"),
      (e) => e.aggregate === "viewer",
    );
    this.store = new Store<Viewer, DecisionState>(
      "viewer",
      (id, decisionState, createAndPublish) => new Viewer(id, decisionState, createAndPublish, options),
      viewerDecisionProvider,
      (event) => eventBus.publish(event),
    );

    this.viewerAchsProj = new ViewerAchievementsProjection(storage.getKeyValueStorage("viewer-achievements"));
    eventBus.onEvent((event) => this.viewerAchsProj.handleEvent(event));

    this.displayNameProj = new DisplayNameProjection(storage.getKeyValueStorage("viewer-display-name"));
    eventBus.onEvent((event) => this.displayNameProj.handleEvent(event));

    const commandsCmdListener = new CommandsCommandListenener(sendChatMessage, options);
    eventBus.onEvent((event) => commandsCmdListener.handleEvent(event));

    const achsCmdListener = new AchievementsCommandListenener(
      this.viewerAchsProj,
      this.displayNameProj,
      sendChatMessage,
      options,
    );
    eventBus.onEvent((event) => achsCmdListener.handleEvent(event));
  }

  public get(id: string) {
    return this.store.get(id);
  }
}

import { EventBus, Store, StoredDecisionProvider } from "es-objects";
import { Storage } from "../../storage";
import { AchievementsCommandListenener } from "./listeners/achievements-command-listener";
import { CommandsCommandListenener } from "./listeners/commands-command-listener";
import { DistributedAchievementsProjection } from "./projections/distributed-achievements-projection";
import { ViewerAchievementsProjection } from "./projections/viewer-achievements-projection";
import { ViewerNameProjection } from "./projections/viewer-name-projection";
import { DecisionState, getDecisionReducer, Viewer } from "./viewer";

export class ViewerDomain {
  private store: Store<Viewer, DecisionState>;
  private viewerAchsProj: ViewerAchievementsProjection;
  private viewerNameProj: ViewerNameProjection;
  private distributedAchsProj: DistributedAchievementsProjection;

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

    this.viewerNameProj = new ViewerNameProjection(storage.getKeyValueStorage("viewer-name"));
    eventBus.onEvent((event) => this.viewerNameProj.handleEvent(event));

    this.distributedAchsProj = new DistributedAchievementsProjection(
      storage.getValueStorage("viewer-distributed-achievements"),
    );
    eventBus.onEvent((event) => this.distributedAchsProj.handleEvent(event));

    const commandsCmdListener = new CommandsCommandListenener(sendChatMessage, options);
    eventBus.onEvent((event) => commandsCmdListener.handleEvent(event));

    const achsCmdListener = new AchievementsCommandListenener(
      this.viewerAchsProj,
      this.viewerNameProj,
      sendChatMessage,
      options,
    );
    eventBus.onEvent((event) => achsCmdListener.handleEvent(event));
  }

  public get(id: string) {
    return this.store.get(id);
  }

  public async getDistributedAchievements() {
    return this.distributedAchsProj.get();
  }
}

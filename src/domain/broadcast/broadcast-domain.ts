import { EventBus, PersistedDecisionProvider, Store } from "es-objects";
import { PgStorage } from "../../storage/pg-storage";
import { Broadcast, decisionReducer } from "./broadcast";

export class BroadcastDomain {
  private store: Store<Broadcast, any>;
  private decisionProvider: PersistedDecisionProvider<any>;

  constructor(eventBus: EventBus, storage: PgStorage) {
    this.decisionProvider = new PersistedDecisionProvider(
      "broadcast",
      decisionReducer,
      storage.getKeyValueStorage("broadcast-decision"),
    );
    this.store = new Store(
      "broadcast",
      (id, decisionState, createAndPublish) => new Broadcast(decisionState, createAndPublish),
      this.decisionProvider,
      (event) => eventBus.publish(event),
    );
  }

  public async get(): Promise<Broadcast> {
    return this.store.get("broadcast");
  }

  public decisionRebuildStream() {
    return this.decisionProvider.rebuildStream();
  }

}

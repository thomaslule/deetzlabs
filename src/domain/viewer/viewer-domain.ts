import { EventBus,  PersistedDecisionProvider, Store } from "es-objects";
import { PgStorage } from "../../storage/pg-storage";
import { Query } from "../query/query";
import { DecisionState, getDecisionReducer, Viewer } from "./viewer";

export class ViewerDomain {
  private store: Store<Viewer, DecisionState>;
  private viewerDecisionProvider: PersistedDecisionProvider<any>;

  constructor(
    eventBus: EventBus,
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
  }

  public async get(id: string) {
    return this.store.get(id);
  }

  public async setTopClipper(id: string, name: string, query: Query) {
    const previous = await query.getTopClipper();
    if (previous !== id) {
      if (previous !== undefined) {
        await (await this.get(previous)).notTopClipper();
      }
      await (await this.get(id)).topClipper(name);
    }
  }

  public decisionRebuildStream() {
    return this.viewerDecisionProvider.rebuildStream();
  }
}

import { EventBus, makeDecisionReducer, PersistedDecisionProvider, projectFromEvents, Store } from "es-objects";
import * as logger from "winston";
import { PgStorage } from "../../storage/pg-storage";
import { Query } from "../query/query";
import { DecisionState, getDecisionReducer, Viewer } from "./viewer";

export class ViewerDomain {
  private store: Store<Viewer, DecisionState>;
  private viewerDecisionProvider: PersistedDecisionProvider<any>;

  constructor(
    eventBus: EventBus,
    private storage: PgStorage,
    private options: any,
  ) {
    this.viewerDecisionProvider = new PersistedDecisionProvider(
      "viewer",
      getDecisionReducer(this.options),
      this.storage.getKeyValueStorage("viewer-decision"),
    );
    this.store = new Store<Viewer, DecisionState>(
      (id, decisionSequence, publish) =>
        new Viewer(id, decisionSequence, publish, this.options),
      this.viewerDecisionProvider,
      (event) => eventBus.publish(event).catch((err) => { this.rebuildDecisionFor(event.id); throw err; }),
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
      const newTopClipper = await this.get(id);
      await newTopClipper.setName(name);
      await newTopClipper.topClipper();
    }
  }

  public decisionRebuildStream() {
    return this.viewerDecisionProvider.rebuildStream();
  }

  private async rebuildDecisionFor(id: string) {
    try {
      const events = this.storage.getEventStorage().getEvents("viewer", id);
      const projection = await projectFromEvents(makeDecisionReducer(getDecisionReducer(this.options)), events);
      await this.storage.getKeyValueStorage("viewer-decision").store(id, projection);
    } catch (err) {
      logger.error("could not rebuild decision projection for viewer %s: %s", id, err);
    }
  }
}

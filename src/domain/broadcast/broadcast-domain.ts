import {
  EventBus,
  EventStorage,
  FromEventsDecisionProvider,
  Store
} from "es-objects";
import { Broadcast, decisionReducer } from "./broadcast";

export class BroadcastDomain {
  private store: Store<Broadcast, any>;

  constructor(eventBus: EventBus, eventStorage: EventStorage) {
    const decisionProvider = new FromEventsDecisionProvider(
      "broadcast",
      decisionReducer,
      eventStorage
    );
    this.store = new Store(
      (id, decisionSequence, publish) =>
        new Broadcast(decisionSequence, publish),
      decisionProvider,
      event => eventBus.publish(event)
    );
  }

  public async get(): Promise<Broadcast> {
    return this.store.get("broadcast");
  }
}

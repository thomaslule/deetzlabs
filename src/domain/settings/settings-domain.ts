import {
  DecisionProvider, DecisionSequence, EventBus, InMemoryReduceProjection, Store,
} from "es-objects";
import { Settings } from "./settings";

export class SettingsDomain {
  private store: Store<Settings, undefined>;

  constructor(
    eventBus: EventBus,
  ) {
    this.store = new Store<Settings, undefined>(
      "settings",
      (id, decisionState, createAndPublish) => new Settings(createAndPublish),
      new VoidDecisionProvider(),
      (event) => eventBus.publish(event),
    );
  }

  public async get(): Promise<Settings> {
    return this.store.get("settings");
  }
}

class VoidDecisionProvider implements DecisionProvider<undefined> {
  public async getDecisionProjection(): Promise<InMemoryReduceProjection<DecisionSequence<undefined>>> {
    return new InMemoryReduceProjection<DecisionSequence<undefined>>(() => ({ decision: undefined, sequence: 0 }));
  }
}

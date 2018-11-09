import {
  DecisionProvider, DecisionSequence, EventBus, EventStorage, Store,
} from "es-objects";
import { Settings } from "./settings";

export class SettingsDomain {
  private store: Store<Settings, undefined>;

  constructor(
    eventBus: EventBus,
    eventStorage: EventStorage,
  ) {
    this.store = new Store<Settings, undefined>(
      (id, decisionSequence, publish) => new Settings(decisionSequence, publish),
      new VoidDecisionProvider(eventStorage),
      (event) => eventBus.publish(event),
    );
  }

  public async get(): Promise<Settings> {
    return this.store.get("settings");
  }
}

class VoidDecisionProvider implements DecisionProvider<undefined> {
  constructor(private eventStorage: EventStorage) {
  }

  public async getDecisionSequence(): Promise<DecisionSequence<undefined>> {
    const sequence = await this.eventStorage.getCurrentSequence("settings", "settings");
    return { decision: undefined, sequence };
  }
}

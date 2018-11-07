import {
  DecisionProvider, DecisionSequence, Event, EventBus, EventStorage, InMemoryReduceProjection, Store,
} from "es-objects";
import { Settings } from "./settings";

export class SettingsDomain {
  private store: Store<Settings, undefined>;

  constructor(
    eventBus: EventBus,
    eventStorage: EventStorage,
  ) {
    this.store = new Store<Settings, undefined>(
      "settings",
      (id, decisionState, createAndPublish) => new Settings(createAndPublish),
      new VoidDecisionProvider(eventStorage),
      (event) => eventBus.publish(event),
    );
  }

  public async get(): Promise<Settings> {
    return this.store.get("settings");
  }
}

class VoidDecisionProvider implements DecisionProvider<undefined> {

  private static reducer(state: any, event: Event) {
    return {
      decision: undefined,
      sequence: event.sequence,
    };
  }

  constructor(private eventStorage: EventStorage) {
  }

  public async getDecisionProjection(): Promise<InMemoryReduceProjection<DecisionSequence<undefined>>> {
    const sequence = await this.eventStorage.getCurrentSequence("settings", "settings");
    return new InMemoryReduceProjection<DecisionSequence<undefined>>(
      VoidDecisionProvider.reducer,
      { decision: undefined, sequence },
    );
  }
}

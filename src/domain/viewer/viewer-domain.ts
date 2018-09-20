import { EventBus, KeyValueStorage, Store, StoredDecisionProvider } from "es-objects";
import { CommandsCommandListenener } from "./listeners/commands-command-listener";
import { DecisionState, getDecisionReducer, Viewer } from "./viewer";

export class ViewerDomain {
  private store: Store<Viewer, DecisionState>;

  constructor(
    eventBus: EventBus,
    sendChatMessage: (msg: string) => void,
    decisionStorage: KeyValueStorage<any>,
    options: any,
  ) {
    const viewerDecisionProvider = new StoredDecisionProvider(
      getDecisionReducer(options),
      decisionStorage,
      (e) => e.aggregate === "viewer",
    );
    this.store = new Store<Viewer, DecisionState>(
      "viewer",
      (id, decisionState, createAndPublish) => new Viewer(id, decisionState, createAndPublish, options),
      viewerDecisionProvider,
      (event) => eventBus.publish(event),
    );
    const commandsCommandListener = new CommandsCommandListenener(sendChatMessage, options);
    eventBus.onEvent((event) => commandsCommandListener.handleEvent(event));
  }

  public get(id: string) {
    return this.store.get(id);
  }
}

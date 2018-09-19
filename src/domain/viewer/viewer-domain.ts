import { EventBus, KeyValueStorage, Store, StoredDecisionProvider } from "es-objects";
import { CommandsCommandListenener } from "./listeners/commands-command-listener";
import { decisionReducer, DecisionState, Viewer } from "./viewer";

export class ViewerDomain {
  private store: Store<Viewer, DecisionState>;

  constructor(
    eventBus: EventBus,
    sendChatMessage: (msg: string) => void,
    decisionStorage: KeyValueStorage<any>,
    options: any,
  ) {
    const viewerDecisionProvider = new StoredDecisionProvider(
      decisionReducer,
      decisionStorage,
      (e) => e.aggregate === "viewer",
    );
    this.store = new Store<Viewer, DecisionState>("viewer", Viewer, viewerDecisionProvider, eventBus);
    const commandsCommandListener = new CommandsCommandListenener(sendChatMessage, options);
    eventBus.onEvent((event) => commandsCommandListener.handleEvent(event));
  }

  public get(id: string) {
    return this.store.get(id);
  }
}

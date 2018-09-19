import { EventBus, KeyValueStorage, Store, StoredDecisionProvider } from "es-objects";
import { eventsTypes } from "./events";
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
    eventBus.onEvent((e) => {
      if (
        e.aggregate === "viewer"
        && e.type === eventsTypes.sentChatMessage
        && e.message.commandsCommand
      ) {
        sendChatMessage(options.commands_answer);
      }
    });
  }

  public get(id: string) {
    return this.store.get(id);
  }
}

import { EventBus, Store, StoredDecisionProvider } from "es-objects";
import { Storage } from "../../storage";
import { Broadcast, decisionReducer } from "./broadcast";
import { BroadcastProjection } from "./broadcast-projection";

export class BroadcastDomain {
  private store: Store<Broadcast, any>;
  private projection: BroadcastProjection;

  constructor(eventBus: EventBus, storage: Storage) {
    const decisionProvider = new StoredDecisionProvider(
      decisionReducer,
      storage.getKeyValueStorage("broadcast-decision"),
      (e) => e.aggregate === "broadcast",
    );
    this.store = new Store(
      "broadcast",
      (id, decisionState, createAndPublish) => new Broadcast(decisionState, createAndPublish),
      decisionProvider,
      (event) => eventBus.publish(event),
    );

    this.projection = new BroadcastProjection(storage.getValueStorage("broadcast-number"));
    eventBus.onEvent((event) => this.projection.handleEvent(event));
  }

  public async begin(game: string): Promise<void> {
    const broadcast = await this.store.get("broadcast");
    await broadcast.begin(game);
  }

  public async changeGame(game: string): Promise<void> {
    const broadcast = await this.store.get("broadcast");
    await broadcast.changeGame(game);
  }

  public async end(): Promise<void> {
    const broadcast = await this.store.get("broadcast");
    await broadcast.end();
  }

  public async isBroadcasting(): Promise<boolean> {
    return this.projection.isBroadcasting();
  }

  public async getBroadcastNumber(): Promise<number | undefined> {
    return this.projection.getBroadcastNumber();
  }

  public async getGame(): Promise<string> {
    return this.projection.getGame();
  }

}

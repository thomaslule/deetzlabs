import { Event, EventBus, PersistedDecisionProvider, Store } from "es-objects";
import { Readable } from "stream";
import * as filter from "stream-filter";
import { PgStorage } from "../../storage/pg-storage";
import { Broadcast, decisionReducer } from "./broadcast";
import { BroadcastProjection } from "./broadcast-projection";

export class BroadcastDomain {
  private store: Store<Broadcast, any>;
  private decisionProvider: PersistedDecisionProvider<any>;
  private projection: BroadcastProjection;

  constructor(eventBus: EventBus, storage: PgStorage) {
    this.decisionProvider = new PersistedDecisionProvider(
      "broadcast",
      decisionReducer,
      storage.getKeyValueStorage("broadcast-decision"),
    );
    this.store = new Store(
      "broadcast",
      (id, decisionState, createAndPublish) => new Broadcast(decisionState, createAndPublish),
      this.decisionProvider,
      (event) => eventBus.publish(event),
    );

    this.projection = new BroadcastProjection();
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

  public isBroadcasting(): boolean {
    return this.projection.isBroadcasting();
  }

  public getBroadcastNumber(): number | undefined {
    return this.projection.getBroadcastNumber();
  }

  public getGame(): string {
    return this.projection.getGame();
  }

  public async initCache(events: Readable) {
    await this.projection.rebuild(events.pipe(filter.obj((event: Event) => event.aggregate === "broadcast")));
  }

  public async rebuild(events: Readable) {
    await Promise.all([
      this.decisionProvider.rebuild(events),
      this.projection.rebuild(events),
    ]);
  }

}

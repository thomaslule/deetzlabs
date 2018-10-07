import { Event, PersistedReduceProjection, Reducer, ValueStorage } from "es-objects";

export interface DistributedAchievement {
  viewer: string;
  achievement: string;
}

const reducer: Reducer<DistributedAchievement[]> = (state = [], event) => {
  return event.type === "got-achievement"
    ? state.concat({ viewer: event.id, achievement: event.achievement })
    : state;
};

export class DistributedAchievementsProjection {
  private stored: PersistedReduceProjection<DistributedAchievement[]>;

  constructor(storage: ValueStorage<any>) {
    this.stored = new PersistedReduceProjection<DistributedAchievement[]>(
      reducer, storage, (event) => event.aggregate === "viewer",
    );
  }

  public async get(): Promise<DistributedAchievement[]> {
    return this.stored.getState();
  }

  public async handleEvent(event: Event) {
    await this.stored.handleEvent(event);
  }

  public getRebuilder() {
    return this.stored.getRebuilder();
  }
}

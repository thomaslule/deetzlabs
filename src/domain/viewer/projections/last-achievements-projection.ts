import { Event, PersistedReduceProjection, ValueStorage } from "es-objects";
import { ViewerProjection } from "./viewer-projection";

export class LastAchievementsProjection extends PersistedReduceProjection<DistributedAchievement[]> {
  constructor(storage: ValueStorage<DistributedAchievement[]>) {
    super(lastDistributedAchievementsReducer, storage, (event) => event.aggregate === "viewer");
  }

  public async getWithNames(viewerProj: ViewerProjection) {
    const state = await this.getState();
    const viewers = await Promise.all(state.map((distributed) => viewerProj.getState(distributed.viewer)));
    return state.map((distributed, index) => ({
      ...distributed,
      viewerName: viewers[index].name,
    }));
  }
}

export interface DistributedAchievement {
  viewer: string;
  achievement: string;
}

function lastDistributedAchievementsReducer(state: DistributedAchievement[] = [], event: Event) {
  if (event.type === "got-achievement") {
    return [{ viewer: event.id, achievement: event.achievement }, ...state].slice(0, 5);
  }
  return state;
}

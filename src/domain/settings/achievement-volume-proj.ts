import { Event, Reducer, StoredProjection, ValueStorage } from "es-objects";
import { eventsTypes } from "./events";

export class AchievementVolumeProj extends StoredProjection<number> {
  constructor(storage: ValueStorage<number>) {
    super(reducer, storage, (e) => e.aggregate === "settings");
  }
}

const reducer: Reducer<number> = (state = 0.5, event: Event) => {
  if (event.type === eventsTypes.achievementVolumeChanged) {
    return event.volume;
  }
  return state;
};
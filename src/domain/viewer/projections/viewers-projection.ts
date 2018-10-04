import { Event } from "es-objects";
import { ViewersProjectionStorage } from "./viewers-projection-storage";

const durationOfWaitForRetry = 10;

export class ViewersProjection {
  constructor(private storage: ViewersProjectionStorage) {
  }

  public async handleEvent(event: Event): Promise<void> {
    if (event.aggregate === "viewer") {
      if (event.type === "changed-name") {
        await this.storage.setName(event.id, event.name);
      }
      if (event.type === "got-achievement") {
        const viewer = await this.storage.get(event.id);
        const achievements = viewer === undefined
        ? [event.achievement]
        : viewer.achievements.concat(event.achievement);
        await this.storage.setAchievements(event.id, achievements);
      }
    }
  }

  public async get(id: string): Promise<ViewerState | undefined> {
    let stored = await this.getIfNamed(id);
    if (stored === undefined) {
      // if we don't know the viewer, they are probabley new to the system
      // the event that led to this get() is probably currently feeding this proj
      // on second try, we have good chances to get it
      await new Promise((resolve) => setTimeout(resolve, durationOfWaitForRetry));
      stored = await this.getIfNamed(id);
    }
    return stored;
  }

  public async getAll(): Promise<ViewerState[]> {
    return (await this.storage.getAll()).filter((viewer) => viewer.name !== undefined);
  }

  public getRebuilder() {

  }

  private async getIfNamed(id: string) {
    const viewer = await this.storage.get(id);
    return viewer !== undefined && viewer.name !== undefined ? viewer : undefined;
  }
}

export interface ViewerState {
  id: string;
  name: string;
  achievements: string [];
}

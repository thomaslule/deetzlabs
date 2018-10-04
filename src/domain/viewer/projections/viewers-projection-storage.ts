import { Obj } from "../../../util";

export class ViewersProjectionStorage {
  constructor(private viewers: Obj = {}) {
  }

  public async get(id: string) {
    return this.viewers[id];
  }

  public async setName(id: string, name: string) {
    const viewer = this.getOrInit(id);
    this.viewers = {
      ...this.viewers,
      [id]: { ...viewer, name },
    };
  }

  public async setAchievements(id: string, achievements: string) {
    const viewer = this.getOrInit(id);
    this.viewers = {
      ...this.viewers,
      [id]: { ...viewer, achievements },
    };
  }

  public async getAll() {
    return Object.values(this.viewers);
  }

  private getOrInit(id: string) {
    return this.viewers[id] || { id, name: undefined, achievements: [] };
  }
}

import { Event, Rebuildable } from "es-objects";
import { Writable } from "stream";
import { PgViewerStorage } from "../../storage/pg-viewer-storage";

export class ViewerProjection implements Rebuildable {
  constructor(private storage: PgViewerStorage) {
  }

  public async handleEvent(event: Event, isReplay = false) {
    if (event.aggregate === "viewer") {
      if (event.type === "changed-name") {
        await this.storage.update(event.id, new Date(event.date), event.name);
      } else if (event.type === "got-achievement") {
        await this.storage.addAchievement(event.id, event.achievement, new Date(event.date));
      } else if (!isReplay) {
        await this.storage.update(event.id, new Date(event.date));
      }
    }
  }

  public rebuildStream() {
    let deletedAll = false;
    const deleteAll = () => this.storage.deleteAll();
    const handleEvent = (event: Event) => this.handleEvent(event, true);
    return new Writable({
      objectMode: true,
      async write(event, encoding, callback) {
        try {
          if (!deletedAll) { await deleteAll(); deletedAll = true; }
          await handleEvent(event);
          callback();
        } catch (err) {
          callback(err);
        }
      },
      async final(callback) {
        try {
          if (!deletedAll) { await deleteAll(); }
          callback();
        } catch (err) {
          callback(err);
        }
      },
    });
  }
}

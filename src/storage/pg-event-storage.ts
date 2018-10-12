import { Event, EventStorage } from "es-objects";
import { Pool } from "pg";
import * as QueryStream from "pg-query-stream";
import { Stream, Transform } from "stream";

export class PgEventStorage implements EventStorage {

  constructor(private db: Pool) {
  }

  public async store(event: Event) {
    await this.db.query(
      "insert into events(aggregate, id, sequence, event) values ($1, $2, $3, $4)",
      [event.aggregate, event.id, event.sequence, JSON.stringify(event)],
    );
  }

  public getEvents(aggregate: string, id: string, fromSequence?: number): Stream {
    return this.getStream(new QueryStream(
      "select event from events where aggregate = $1 and id = $2 order by sequence",
      [aggregate, id],
    )).pipe(rowToEvent());
  }

  public getAllEvents(): Stream {
    return this.getStream(new QueryStream(
      "select event from events order by event_id",
    )).pipe(rowToEvent());
  }

  private getStream(query: QueryStream) {
    const stream = new Transform({
      objectMode: true,
      transform(row, encoding, callback) {
        this.push(row);
        callback();
      },
    });
    this.db.connect()
    .then((client) => {
      client.query(query)
        .on("end", () => { client.release(); })
        .on("error", (err) => {
          client.release();
          stream.emit("error", err);
        })
        .pipe(stream);
    })
    .catch((err) => { stream.emit("error", err); });
    return stream;
  }
}

function rowToEvent() {
  return new Transform({
    objectMode: true,
    transform(row, encoding, callback) {
      this.push(row.event);
      callback();
    },
  });
}

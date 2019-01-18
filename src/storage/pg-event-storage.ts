import { Event, EventStorage } from "es-objects";
import { Pool } from "pg";
import * as QueryStream from "pg-query-stream";
import { PassThrough, Readable, Transform } from "stream";

export class PgEventStorage implements EventStorage {
  constructor(private db: Pool) {}

  public async store(event: Event) {
    await this.db.query(
      "insert into events(aggregate, id, sequence, event) values ($1, $2, $3, $4)",
      [event.aggregate, event.id, event.sequence, JSON.stringify(event)]
    );
  }

  public getEvents(
    aggregate?: string,
    id?: string,
    fromSequence?: number
  ): Readable {
    let query = "select event from events";
    const params = [];
    if (aggregate !== undefined) {
      query += " where aggregate = $1";
      params.push(aggregate);
      if (id !== undefined) {
        query += " and id = $2";
        params.push(id);
        if (fromSequence !== undefined) {
          query += " and sequence >= $3";
          params.push(fromSequence);
        }
      }
    }
    query += " order by event_id";
    return this.getStream(new QueryStream(query, params)).pipe(rowToEvent());
  }

  public async getCurrentSequence(aggregate: string, id: string) {
    const result = await this.db.query(
      "select max(sequence) as max from events where aggregate = $1 and id = $2",
      [aggregate, id]
    );
    return result.rows[0].max === null ? 0 : result.rows[0].max;
  }

  private getStream(query: QueryStream) {
    const stream = new PassThrough({ objectMode: true });
    this.db
      .connect()
      .then(client => {
        client
          .query(query)
          .on("end", () => {
            client.release();
          })
          .on("error", err => {
            client.release();
            stream.emit("error", err);
          })
          .pipe(stream);
      })
      .catch(err => {
        stream.emit("error", err);
      });
    return stream;
  }
}

function rowToEvent() {
  return new Transform({
    objectMode: true,
    transform(row, encoding, callback) {
      this.push(row.event);
      callback();
    }
  });
}

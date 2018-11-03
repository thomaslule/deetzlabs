import * as assert from "assert";
import { Dictionary, KeyValueStorage } from "es-objects";
import { Pool } from "pg";

export class PgKeyValueStorage<T> implements KeyValueStorage<T> {
  constructor(private name: string, private db: Pool) {
  }

  public async get(key: string): Promise<T | undefined> {
    assert(key, "key must be non-empty");
    const result = await this.db.query("select value from projections where name = $1 and key = $2", [this.name, key]);
    return result.rowCount === 0 ? undefined : result.rows[0].value.value;
  }

  public async store(key: string, value: T) {
    assert(key, "key must be non-empty");
    await this.db.query(`
      insert into projections(name, key, value) values ($1, $2, $3)
      on conflict (name, key) do update set value = $3
    `, [this.name, key, { value }]);
  }

  public async delete(key: string) {
    await this.db.query("delete from projections where name = $1 and key = $2", [this.name, key]);
  }

  public async getAll(): Promise<Dictionary<T>> {
    const result = await this.db.query("select key, value from projections where name = $1", [this.name]);
    return result.rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value.value }), {});
  }

  public async deleteAll() {
    await this.db.query("delete from projections where name = $1", [this.name]);
  }

}

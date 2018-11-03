import { ValueStorage } from "es-objects";
import { Pool } from "pg";

export class PgValueStorage<T> implements ValueStorage<T> {

  constructor(private name: string, private db: Pool) {
  }

  public async get(): Promise<T | undefined> {
    const result = await this.db.query("select value from projections where name = $1 and key = ''", [this.name]);
    return result.rowCount === 0 ? undefined : result.rows[0].value.value;
  }

  public async store(value: T) {
    await this.db.query(`
      insert into projections(name, key, value) values ($1, '', $2)
      on conflict (name, key) do update set value = $2
    `, [this.name, { value }]);
  }

  public async delete() {
    await this.db.query("delete from projections where name = $1 and key = ''", [this.name]);
  }
}

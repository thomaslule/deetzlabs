import { Pool } from "pg";

export async function getCleanDb() {
  const db = new Pool({ connectionString: "postgresql://postgres:admin@localhost:5432/deetzlabs_test" });
  await db.query("drop table if exists events");
  await db.query(`
    create table events(
      event_id serial primary key,
      aggregate char(50) not null,
      id text not null,
      sequence integer not null,
      event json not null,
      constraint uc_events unique(aggregate, id, sequence)
    );
  `);
  return db;
}

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
  await db.query("drop table if exists values");
  await db.query(`
    create table values(
      name text not null,
      key text not null,
      value json not null,
      primary key(name, key)
    );
  `);
  return db;
}

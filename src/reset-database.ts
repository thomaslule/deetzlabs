import { Pool } from "pg";

export async function resetDatabase(connectionString = "postgresql://postgres:admin@localhost:5432/deetzlabs_test") {
  const db = new Pool({ connectionString });
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
  await db.query("drop table if exists projections");
  await db.query(`
    create table projections(
      name text not null,
      key text not null,
      value json not null,
      primary key(name, key)
    );
  `);
  await db.query("drop table if exists viewers");
  await db.query(`
    create table viewers(
      id text primary key,
      name text not null default '',
      last_action timestamp not null
    );
  `);
  await db.query("drop table if exists achievements");
  await db.query(`
    create table achievements(
      viewerId text not null,
      achievement text not null,
      date timestamp not null,
      primary key(viewerId, achievement)
    );
  `);
  await db.end();
}

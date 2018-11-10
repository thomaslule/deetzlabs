import { Pool } from "pg";

export async function resetDatabase(connectionString = "postgresql://postgres:admin@localhost:5432/deetzlabs_test") {
  const db = new Pool({ connectionString });
  await db.query(sql);
  await db.end();
}

const sql = `
drop table if exists events;
create table events(
  event_id serial primary key,
  aggregate char(50) not null,
  id text not null,
  sequence integer not null,
  event json not null,
  constraint uc_events unique(aggregate, id, sequence)
);

drop table if exists projections;
create table projections(
  name text not null,
  key text not null,
  value json not null,
  primary key(name, key)
);

drop table if exists viewers;
create table viewers(
  id text primary key,
  name text not null default '',
  last_action timestamptz not null
);

drop table if exists achievements;
create table achievements(
  viewerId text not null,
  achievement text not null,
  date timestamptz not null,
  primary key(viewerId, achievement)
);
`;

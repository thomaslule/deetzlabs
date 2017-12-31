create table if not exists events(
  event_id bigserial primary key not null,
  insert_date char(30) not null,
  aggregate char(50) not null,
  object_id text not null,
  event json not null
);
create index if not exists events_aggregate_idx on events (aggregate);
create index if not exists events_object_id_idx on events (object_id);

create table if not exists snapshots(
  aggregate char(50) not null,
  object_id text not null,
  last_event_id bigint not null,
  snapshot json not null,
  primary key(aggregate, object_id)
);
create index if not exists snapshots_last_event_id_idx on snapshots (last_event_id);

create table if not exists events(
   event_id bigserial primary key not null,
   insert_date char(30) not null,
   aggregate char(50) not null,
   object_id text,
   event json not null
);
create index if not exists events_aggregate_idx on events (aggregate);
create index if not exists events_object_id_idx on events (object_id);

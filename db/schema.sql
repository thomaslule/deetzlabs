create table events(
  insert_date timestamp not null,
  aggregate char(50) not null,
  id text not null,
  sequence integer not null,
  event json not null,
  primary key(aggregate, id, sequence)
);

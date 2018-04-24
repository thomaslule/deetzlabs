const { Pool } = require('pg');
const toArray = require('stream-to-array');
const Storage = require('../src/storage');
const config = require('./config');

let db;
beforeEach(() => { db = new Pool({ connectionString: config.db_url }); });
afterEach(async () => {
  await db.query('truncate table events');
  await db.query('truncate table snapshots');
  await db.end();
});

const jane1 = {
  aggregate: 'user',
  id: 'jane',
  sequence: 1,
  insertDate: '2018-03-09T11:09:51.206Z',
  type: 'created',
  name: 'Jane Dowe',
};

const julia1 = {
  aggregate: 'user',
  id: 'julia',
  sequence: 1,
  insertDate: '2018-03-09T11:09:51.207Z',
  type: 'created',
  name: 'Julia Doe',
};

const jane2 = {
  aggregate: 'user',
  id: 'jane',
  sequence: 2,
  insertDate: '2018-03-09T11:09:51.208Z',
  type: 'saved',
};

const jane3 = {
  aggregate: 'user',
  id: 'jane',
  sequence: 3,
  insertDate: '2018-03-09T11:09:51.208Z',
  type: 'verified',
};

test('can store and retrieve events', async () => {
  const storage = Storage(db);
  await storage.storeEvent(jane1);
  await storage.storeEvent(julia1);
  await storage.storeEvent(jane2);
  await storage.storeEvent(jane3);
  const janeEvts = await toArray(await storage.getEvents('user', 'jane'));
  expect(janeEvts).toEqual([jane1, jane2, jane3]);
  const allEvts = await toArray(await storage.getAllEvents());
  expect(allEvts).toEqual([jane1, julia1, jane2, jane3]);
});

test('getEvents emits error on db error', async () => {
  const badDb = new Pool({ connectionString: 'badurl' });
  const storage = Storage(badDb);
  const stream = storage.getEvents('user', 'jane');
  await new Promise((resolve) => { stream.on('error', resolve); });
  await badDb.end();
});

test('can store and retrieve projections', async () => {
  const storage = Storage(db);
  const proj = { foo: 'bar' };
  await storage.storeProjection('proj', proj);
  expect(await storage.getProjection('proj')).toEqual(proj);
});

test('can store, update and retrieve snapshots', async () => {
  const storage = Storage(db);
  const snapshot1 = { sequence: 3, state: { foo: 'bar' } };
  const snapshot2 = { sequence: 6, state: { foo: 'baz' } };
  expect(await storage.getSnapshot('user', 'jane', '__decision__')).toBeUndefined();
  await storage.storeSnapshot('user', 'jane', '__decision__', snapshot1);
  expect(await storage.getSnapshot('user', 'jane', '__decision__')).toEqual(snapshot1);
  await storage.storeSnapshot('user', 'jane', '__decision__', snapshot2);
  expect(await storage.getSnapshot('user', 'jane', '__decision__')).toEqual(snapshot2);
});
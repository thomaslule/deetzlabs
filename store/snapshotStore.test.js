const SnapshotStore = require('./snapshotStore');
const connectToDb = require('../test/util/connectToDb');
const deleteData = require('../test/util/deleteData');
const closeDbConnection = require('../test/util/closeDbConnection');

let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

afterEach(() => deleteData(db));

afterAll(() => closeDbConnection(db));

test('snapshot stored, updated, and retrieved', async () => {
  const store = SnapshotStore(db);
  await store.store('some aggregate', 'some object id', '100', { foo: 'bar' });
  await store.store('some aggregate', 'some object id', '200', { foo: 'bar2' });
  const snapshot = await store.get('some aggregate', 'some object id');
  expect(snapshot.lastEventId).toBe('200');
  expect(snapshot.snapshot).toEqual({ foo: 'bar2' });
});

test('when no snapshot stored, retrieve empty snapshot', async () => {
  const store = SnapshotStore(db);
  const snapshot = await store.get('some aggregate', 'some object id');
  expect(snapshot.lastEventId).toBe('0');
  expect(snapshot.snapshot).toBe(undefined);
});

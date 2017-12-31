const AggregateEventStore = require('./aggregateEventStore');
const EventStore = require('./eventStore');
const SnapshotStore = require('./snapshotStore');
const connectToDb = require('./test/util/connectToDb');
const deleteData = require('./test/util/deleteData');
const closeDbConnection = require('./test/util/closeDbConnection');
const projection = require('./util/projection');

let db;
let eventStore;
let snapshotStore;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => {
  eventStore = EventStore(db);
  snapshotStore = SnapshotStore(db);
});

afterEach(() => deleteData(db));

afterAll(() => closeDbConnection(db));

const Counter = (id, eventsHistory, initState = 0) => {
  const decProj = projection(
    eventsHistory,
    initState,
    state => state + 1,
  );

  return { getState: decProj.getState };
};

const event = {
  aggregate: 'aggregate', id: 'test', type: 'truc', insert_date: (new Date()).toISOString(),
};

test('call calculateNewEvents func with item', async () => {
  const store = AggregateEventStore(eventStore, snapshotStore, 'aggregate', Counter);
  const mockLogic = jest.fn();
  mockLogic.mockReturnValue([event]);
  await store.add('test', mockLogic);
  expect(mockLogic.mock.calls).toHaveLength(1);
  expect(mockLogic.mock.calls[0][0].getState()).toBe(0);
  // on next call counter was incremented
  await store.add('test', mockLogic);
  expect(mockLogic.mock.calls).toHaveLength(2);
  expect(mockLogic.mock.calls[1][0].getState()).toBe(1);
});

test('create snapshot if necessary', async () => {
  await Promise.all([
    eventStore.insert(event),
    eventStore.insert(event),
    eventStore.insert(event),
  ]);
  const store = AggregateEventStore(eventStore, snapshotStore, 'aggregate', Counter, { maxEventsLength: 2 });
  const mockLogic = jest.fn();
  mockLogic.mockReturnValue([]);
  await store.add('test', mockLogic);
  const snapshot = await SnapshotStore(db).get('aggregate', 'test');
  const rows = await eventStore.get('aggregate', 'test');
  expect(snapshot.lastEventId).toBe(rows[rows.length - 1].event_id);
  expect(snapshot.snapshot).toEqual(3);
});

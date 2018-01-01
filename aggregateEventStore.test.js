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

const Proj = (eventsHistory, initState = 0) =>
  projection(eventsHistory, initState, state => state + 1);

const event = {
  aggregate: 'aggregate', id: 'test', type: 'truc', insert_date: (new Date()).toISOString(),
};

test('call calculateNewEvents func with projection and store its results', async () => {
  const store = AggregateEventStore(eventStore, snapshotStore, 'aggregate', Proj);
  const mockLogic = jest.fn();
  mockLogic.mockReturnValue([event]);

  await store.add('test', mockLogic);

  expect(mockLogic.mock.calls).toHaveLength(1);
  const projGiven1 = mockLogic.mock.calls[0][0];
  expect(projGiven1.getState()).toBe(0);

  await store.add('test', mockLogic);

  // on next call counter was incremented
  expect(mockLogic.mock.calls).toHaveLength(2);
  const projGiven2 = mockLogic.mock.calls[1][0];
  expect(projGiven2.getState()).toBe(1);
});

test('use snapshot if there is one', async () => {
  await snapshotStore.store('aggregate', 'test', '0', 50);
  const store = AggregateEventStore(eventStore, snapshotStore, 'aggregate', Proj);
  const mockLogic = jest.fn();
  mockLogic.mockReturnValue([]);

  await store.add('test', mockLogic);

  const projGiven = mockLogic.mock.calls[0][0];
  expect(projGiven.getState()).toBe(50);
});

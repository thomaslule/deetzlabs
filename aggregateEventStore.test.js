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
let store;

const Proj = (eventsHistory, initState = 0) =>
  projection(eventsHistory, initState, state => state + 1);

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => {
  eventStore = EventStore(db);
  snapshotStore = SnapshotStore(db);
  store = AggregateEventStore(eventStore, snapshotStore, 'aggregate', Proj);
});

afterEach(() => deleteData(db));

afterAll(() => closeDbConnection(db));

const event = {
  aggregate: 'aggregate', id: 'test', type: 'truc', insert_date: (new Date()).toISOString(),
};

test('store calculateNewEvents results', async () => {
  const mockLogic = jest.fn();
  mockLogic.mockReturnValue(event);

  await store.add('test', mockLogic);

  const stored = await eventStore.get('aggregate', 'test');
  expect(stored).toHaveLength(1);
});

test('if calculateNewEvents returns an array, all the events are stored', async () => {
  const mockLogic = jest.fn();
  mockLogic.mockReturnValue([event, event]);

  await store.add('test', mockLogic);

  const stored = await eventStore.get('aggregate', 'test');
  expect(stored).toHaveLength(2);
});

test('call calculateNewEvents func with a projection fueled by the stored events', async () => {
  const mockLogic = jest.fn();
  mockLogic.mockReturnValue([]);
  await eventStore.insert(event);
  await eventStore.insert(event);

  await store.add('test', mockLogic);

  expect(mockLogic.mock.calls).toHaveLength(1);
  const projGiven = mockLogic.mock.calls[0][0];
  expect(projGiven.getState()).toBe(2);
});

test('use snapshot if there is one', async () => {
  await snapshotStore.store('aggregate', 'test', '0', 50);
  const mockLogic = jest.fn();
  mockLogic.mockReturnValue([]);

  await store.add('test', mockLogic);

  const projGiven = mockLogic.mock.calls[0][0];
  expect(projGiven.getState()).toBe(50);
});

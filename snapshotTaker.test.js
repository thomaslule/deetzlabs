const EventStore = require('./eventStore');
const SnapshotStore = require('./snapshotStore');
const SnapShotTaker = require('./snapshotTaker');
const projection = require('./util/projection');
const connectToDb = require('./test/util/connectToDb');
const deleteData = require('./test/util/deleteData');
const closeDbConnection = require('./test/util/closeDbConnection');

const Proj = (eventsHistory, initState = { nb: 0 }) =>
  projection(eventsHistory, initState, state => ({ nb: state.nb + 1 }));

const event = {
  aggregate: 'aggregate', id: 'test', type: 'truc', insert_date: (new Date()).toISOString(),
};

let db;
let eventStore;
let snapshotStore;
let snapshotTaker;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(async () => {
  eventStore = EventStore(db);
  snapshotStore = SnapshotStore(db);
  snapshotTaker = SnapShotTaker(
    eventStore,
    snapshotStore,
    'aggregate',
    Proj,
    3,
  );
  await deleteData(db);
});

afterAll(() => closeDbConnection(db));

const expectNoSnapshotStored = async () => {
  const snapshot = await snapshotStore.get('aggregate', 'test');
  expect(snapshot).toEqual({ lastEventId: '0', snapshot: undefined });
};

const expectSnapshotIs = async (expected) => {
  const snapshot = await snapshotStore.get('aggregate', 'test');
  expect(snapshot.snapshot).toEqual(expected);
};

const eventHappened = async () => {
  await eventStore.insert(event);
  await snapshotTaker.onEvent(event);
};

const eventReplayed = async () => {
  await eventStore.insert(event);
  await snapshotTaker.onEvent(event, true);
};

describe('snapshotTaker refresh', () => {
  test('retrieve the events and store the result of the projection in the snapshotStore', async () => {
    await Promise.all([
      eventStore.insert(event),
      eventStore.insert(event),
      eventStore.insert(event),
    ]);
    await snapshotTaker.refresh('test');
    await expectSnapshotIs({ nb: 3 });
  });

  test('if no event retrieved, dont store anything', async () => {
    await snapshotTaker.refresh('test');
    await expectNoSnapshotStored();
  });
});

describe('snapshotTaker refreshAll', () => {
  test('if it knows an aggregate with enough events, store its snapshot', async () => {
    await eventReplayed();
    await eventReplayed();
    await eventReplayed();
    await expectNoSnapshotStored(); // nothing because it doesnt store on replays
    await snapshotTaker.refreshAll();
    await expectSnapshotIs({ nb: 3 });
  });

  test('if it knows an aggregate with not enough events, dont store its snapshot', async () => {
    await eventReplayed();
    await eventReplayed();
    await snapshotTaker.refreshAll();
    await expectNoSnapshotStored();
  });
});

describe('snapshotTaker onEvent', () => {
  test('store snapshot every N events with same id', async () => {
    await eventHappened();
    await eventHappened();
    await expectNoSnapshotStored();
    await eventHappened();
    await expectSnapshotIs({ nb: 3 });
    await eventHappened();
    await eventHappened();
    await expectSnapshotIs({ nb: 3 });
    await eventHappened();
    await expectSnapshotIs({ nb: 6 });
  });
});

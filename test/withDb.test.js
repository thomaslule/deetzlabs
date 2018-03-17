const config = require('config');
const nock = require('nock');
const Closet = require('event-closet').default;
const { Pool } = require('pg');
const closetStorage = require('../src/closet/storage');
const App = require('../src/app');
const {
  mockAllAchievements, postMessage, postAchievement, userHasAchievement,
} = require('./util');

let db;
beforeEach(async () => {
  db = new Pool({ connectionString: config.get('db_url') });
  mockAllAchievements();
});
afterEach(async () => {
  await db.query('truncate table events');
  await db.query('truncate table snapshots');
  await db.end();
  nock.cleanAll();
});

test('persist data in db', async () => {
  const app = App(Closet({ storage: closetStorage(db) }));
  // give achievement
  await postMessage(app, 'yo');
  await postAchievement(app, 'benefactor');
  expect(await userHasAchievement(app, 'benefactor')).toBeTruthy();
  // recreate app
  await db.end();
  db = new Pool({ connectionString: config.get('db_url') });
  const closet = Closet({ storage: closetStorage(db), snapshotEvery: 2 });
  const newApp = App(closet);
  await closet.rebuild();
  // achievement still here
  expect(await userHasAchievement(newApp, 'benefactor')).toBeTruthy();
});

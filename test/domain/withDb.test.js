const { Pool } = require('pg');
const closetStorage = require('../../src/storage');
const { postAchievement, postMessage } = require('./util');
const configureCloset = require('../../src/domain');
const { configureLogger } = require('../../src/logger');
const { getAll } = require('../../src/domain/viewer/projections/distributedAchievements');
const config = require('../config');

const userHasAchievement = async (closet) => {
  const distributed = getAll(await closet.getProjection('distributedAchievements'));
  return distributed.find(a => a.viewer === 'someone' && a.achievement === 'cheerleader');
};

afterEach(async () => {
  const db = new Pool({ connectionString: config.db_url });
  await db.query('truncate table events');
  await db.query('truncate table snapshots');
  await db.end();
});

test('persist data in db', async () => {
  configureLogger(config);
  const db = new Pool({ connectionString: config.db_url });
  const closet = configureCloset({
    closetOptions: { storage: closetStorage(db), snapshotEvery: 2 },
    achievements: config.achievements,
  });
  // give achievement
  await postMessage(closet);
  await postAchievement(closet, 'cheerleader');
  expect(await userHasAchievement(closet)).toBeTruthy();
  // recreate app
  await db.end();
  const db2 = new Pool({ connectionString: config.db_url });
  const closet2 = configureCloset({
    closetOptions: { storage: closetStorage(db2), snapshotEvery: 2 },
  });
  await closet2.rebuild();
  // achievement still here
  expect(await userHasAchievement(closet2)).toBeTruthy();
  await db2.end();
});

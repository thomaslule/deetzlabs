const request = require('supertest');
const nock = require('nock');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');
const postMessage = require('./util/postMessage');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => {
  nock.cleanAll();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

test('post to /migrate_data', () => {
  const expected1 = mockAchievement('Ambianceuse', 'Bim plein de messages dans le chat, gg %USER%');
  const expected2 = mockAchievement('Pom-pom girl', 'Merci pour tes encouragements %USER% !');
  return request(app)
    .post('/api/migrate_data')
    .send([
      {
        key: 'count_messages',
        value: {
          someone: 299,
        },
      },
      { key: 'vigilante', value: {} },
      {
        key: 'viewers',
        value: ['Someone'],
      },
      {
        key: 'cheerleader',
        value: {
          someone: 4,
        },
      },
      {
        key: 'achievements',
        value: [{
          username: 'someone',
          achievement: 'gravedigger',
        }],
      },
      { key: 'gravedigger', value: { someone: 5 } },
      { key: 'careful', value: {} },
      { key: 'swedish', value: {} },
      { key: 'berzingue', value: {} },
    ])
    .expect(200)
    .then(() => postMessage(app, '!gg'))
    .then(() => {
      expected1.done();
      expected2.done();
      return userHasAchievement(app, 'entertainer');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      return userHasAchievement(app, 'cheerleader');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      return userHasAchievement(app, 'gravedigger');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
    });
});

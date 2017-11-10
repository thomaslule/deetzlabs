const nock = require('nock');
const mockAchievement = require('./util/mockAchievement');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');
const showTestAchievement = require('./util/showTestAchievement');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => {
  nock.cleanAll();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

test('post to /show_test_achievement shows achievement', (done) => {
  const expectedCall = mockAchievement('Testeuse', '%USER% bidouille des trucs', 'Berzingator2000');
  showTestAchievement(app)
    .expect(200)
    .then(() => {
      expectedCall.done();
      done();
    });
});

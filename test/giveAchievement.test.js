const nock = require('nock');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');
const postAchievement = require('./util/postAchievement');
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

test('post to /give_achievement gives it to user', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%');
  postAchievement(app, 'Mécène')
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, 'Mécène');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      done();
    });
});

test('post unknown achievement to /give_achievement gives error', (done) => {
  const expectedCall = mockAchievement('Inconnu', 'Bravo %USER% !');
  postAchievement(app, 'Inconnu', 400)
    .then((res) => {
      expect(res.body).toEqual({ error: 'bad_request achievement doesnt exist' });
      expect(expectedCall.isDone()).toBeFalsy();
      return userHasAchievement(app, 'Inconnu');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeFalsy();
      done();
    });
});

test('post to /give_achievement without displayName gives it to user', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%', 'someone');
  postAchievement(app, 'Mécène', 200, 'someone', null)
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, 'Mécène');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      done();
    });
});

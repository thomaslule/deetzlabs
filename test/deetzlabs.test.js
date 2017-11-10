const request = require('supertest');
const postMessage = require('./util/postMessage');
const postAchievement = require('./util/postAchievement');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');
const mockSay = require('./util/mockSay');
const mockAchievement = require('./util/mockAchievement');

test('projections are reloaded on app start', () => {
  let db;
  return connectToDb()
    .then((res) => {
      db = res;
      return initApp(db);
    })
    .then(app => postMessage(app, 'coucou'))
    .then(() => db.close(true))
    .then(() => connectToDb())
    .then((res) => {
      db = res;
      return initApp(db);
    })
    .then(newApp => request(newApp).get('/api/viewers'))
    .then((res) => {
      expect(res.body.someone).toBe('Someone');
    })
    .then(() => db.dropDatabase())
    .then(() => db.close(true));
});

test('achievements and messages are not re-sent', () => {
  let db;
  let app;
  const expectedMessage = mockSay('Moi j\'ai qu\'une commande c\'est !succès');
  const expectedAchievement = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%');
  return connectToDb()
    .then((res) => {
      db = res;
      return initApp(db);
    })
    .then((res) => {
      app = res;
      return postMessage(app, '!commands');
    })
    .then(() => postAchievement(app, 'benefactor'))
    .then(() => {
      expectedMessage.done();
      expectedAchievement.done();
      return db.close(true);
    })
    .then(() => connectToDb())
    .then((res) => {
      db = res;
      return initApp(db);
    })
    .then(() => db.dropDatabase())
    .then(() => db.close(true));
});

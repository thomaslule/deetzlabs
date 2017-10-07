const nock = require('nock');
const initApp = require('./util/initApp');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');
const postAchievement = require('./util/postAchievement');

let storage;
let app;

beforeEach(() => {
  ({ storage, app } = initApp());
});

afterEach(() => {
  nock.cleanAll();
});

test('post to /achievement gives it to user', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%');
  postAchievement(app, 'Mécène')
    .then(() => {
      expectedCall.done();
      expect(userHasAchievement(storage, 'Mécène')).toBeTruthy();
      done();
    });
});

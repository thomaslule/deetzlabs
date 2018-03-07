const nock = require('nock');
const request = require('supertest');
const App = require('../src/app');
const { mockAchievement, showTestAchievement } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

const getVolume = () => request(app).get('/achievement_volume').expect(200);
const postVolume = volume => request(app).post('/change_achievement_volume').send({ volume });

test('volume modified on POST /change_achievement_volume', (done) => {
  const expectedCall = mockAchievement('Testeuse', '%USER% bidouille des trucs', 'Berzingator2000', 0.8);
  postVolume('0.8')
    .expect(200)
    .then(() => showTestAchievement(app))
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('if never set volume is 0.5', (done) => {
  const expectedCall = mockAchievement('Testeuse', '%USER% bidouille des trucs', 'Berzingator2000', 0.5);
  showTestAchievement(app)
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('GET /achievement_volume works', (done) => {
  getVolume()
    .then((response) => {
      expect(response.body.volume).toBe(0.5);
      return postVolume(0.8);
    })
    .then(getVolume)
    .then((response) => {
      expect(response.body.volume).toBe(0.8);
      done();
    });
});

test('bad request on POST /change_achievement_volume with invalid volume', () =>
  postVolume(0).expect(422)
    .then(() => postVolume(50).expect(422))
    .then(() => postVolume('abcd').expect(422)));

const request = require('supertest');
const nock = require('nock');
const App = require('../src/app');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

test('GET /all_achievements returns all the possible achievements', (done) => {
  request(app).get('/all_achievements').expect(200)
    .then((response) => {
      const achievements = response.body;
      expect(achievements.benefactor.name).toBe('Mécène');
      done();
    });
});

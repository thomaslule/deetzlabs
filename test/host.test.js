const request = require('supertest');
const nock = require('nock');
const App = require('../src/app');
const { mockAchievement } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

test('host results in achievement', async () => {
  const expectedCall = mockAchievement('Hospitalière', '%USER% nous accueille sur sa chaîne !', 'someone');
  await request(app).post('/host').send({ viewer: 'someone', nbViewers: 20 }).expect(200);
  expectedCall.done();
});

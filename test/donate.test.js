const request = require('supertest');
const nock = require('nock');
const App = require('../src/app');
const { mockAchievement } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

test('donation results in achievement', async () => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%', 'someone');
  await request(app).post('/donate').send({ viewer: 'someone', amount: 20 }).expect(200);
  expectedCall.done();
});

const nock = require('nock');
const request = require('supertest');
const App = require('../src/app');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

test('can change followers goal template and amount', async () => {
  const newSettings = { goal: 33, html: '<p>some html</p>', css: 'p {color: red}' };
  await request(app).post('/change_followers_goal').send(newSettings);
  const received = await request(app).get('/followers_goal').expect(200);
  expect(received.body).toEqual(newSettings);
});

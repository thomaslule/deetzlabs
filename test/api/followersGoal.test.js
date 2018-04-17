const request = require('supertest');
const { setup } = require('./util');

let app;
beforeEach(() => {
  ({ app } = setup());
});

test('can change followers goal template and amount', async () => {
  const newSettings = { goal: 33, html: '<p>some html</p>', css: 'p {color: red}' };
  await request(app).post('/change_followers_goal').send(newSettings);
  const received = await request(app).get('/followers_goal').expect(200);
  expect(received.body).toEqual(newSettings);
});

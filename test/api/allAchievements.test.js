const request = require('supertest');
const { setup } = require('./util');

let app;
beforeEach(() => {
  ({ app } = setup());
});

test('GET /all_achievements returns all the possible achievements', async () => {
  const response = await request(app).get('/api/all_achievements').expect(200);
  expect(response.body.testing.name).toBe('Testing');
});

const request = require('supertest');
const initApp = require('./util/initApp');

let app;

beforeEach(() => {
  ({ app } = initApp());
});

test('GET /all_achievements returns all the possible achievements', (done) => {
  request(app).get('/api/all_achievements').expect(200)
    .then((response) => {
      const list = response.body;
      expect(list[0]).toEqual({ code: 'test', name: 'Testeuse' });
      expect(list[4]).toEqual({ code: 'benefactor', name: 'Mécène' });
      done();
    });
});

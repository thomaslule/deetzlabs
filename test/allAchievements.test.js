const request = require('supertest');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');

let storage;
let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => {
  ({ app, storage } = initApp(db));
});

afterEach(() => {
  storage.clearSync();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

test('GET /all_achievements returns all the possible achievements', (done) => {
  request(app).get('/api/all_achievements').expect(200)
    .then((response) => {
      const list = response.body;
      expect(list[0]).toEqual({ code: 'test', name: 'Testeuse' });
      expect(list[4]).toEqual({ code: 'benefactor', name: 'Mécène' });
      done();
    });
});

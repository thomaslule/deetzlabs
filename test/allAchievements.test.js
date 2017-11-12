const request = require('supertest');
const nock = require('nock');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');
const deleteData = require('./util/deleteData');
const closeDbConnection = require('./util/closeDbConnection');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => {
  nock.cleanAll();
  return deleteData(db);
});

afterAll(() => closeDbConnection(db));

test('GET /all_achievements returns all the possible achievements', (done) => {
  request(app).get('/api/all_achievements').expect(200)
    .then((response) => {
      const achievements = response.body;
      expect(achievements.benefactor.name).toBe('Mécène');
      done();
    });
});

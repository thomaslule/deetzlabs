const request = require('supertest');
const nock = require('nock');
const initTestStorage = require('./initTestStorage');
const httpServer = require('../httpServer');

let storage;
let app;

const postHejMessage = () => (
  request(app)
    .post('/api/chat_message')
    .send({
      user: {
        username: 'someone',
        'display-name': 'Someone',
      },
      message: 'Hej :)',
    })
);

const mockAchievement = () => (
  nock('http://localhost:3103')
    .post('/achievement', {
      achievement: 'Suédois LV1',
      username: 'Someone',
      text: 'Hej %USER% !',
    })
    .reply(200)
);

const achievementEntry = { username: 'someone', achievement: 'Suédois LV1' };

beforeEach(() => {
  storage = initTestStorage();
  app = httpServer(storage);
});

afterEach(() => {
  nock.cleanAll();
});

test('give achievement when user says Hej', (done) => {
  const achievement = mockAchievement();
  postHejMessage()
    .then((response) => {
      expect(response.statusCode).toBe(200);
      achievement.done();
      expect(storage.getItemSync('achievements')).toEqual([achievementEntry]);
      done();
    });
});

test('dont give achievement twice when user says Hej twice', (done) => {
  let achievement = mockAchievement();
  postHejMessage()
    .then((response1) => {
      expect(response1.statusCode).toBe(200);
      achievement.done();
      achievement = mockAchievement();
      postHejMessage()
        .then((response2) => {
          expect(response2.statusCode).toBe(200);
          expect(achievement.isDone()).toBe(false);
          done();
        });
    });
});

test('dont give achievement if user already has it', (done) => {
  const achievement = mockAchievement();
  storage.setItemSync('achievements', [achievementEntry]);
  postHejMessage()
    .then((response) => {
      expect(response.statusCode).toBe(200);
      expect(achievement.isDone()).toBe(false);
      done();
    });
});

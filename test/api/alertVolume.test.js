const request = require('supertest');
const { setup, showTestAchievement } = require('./util');

let app; let showAchievement;
beforeEach(() => {
  ({ app, showAchievement } = setup());
});

const getVolume = () => request(app).get('/api/achievement_volume').expect(200);
const postVolume = volume => request(app).post('/api/change_achievement_volume').send({ volume });

test('volume modified on POST /change_achievement_volume', (done) => {
  postVolume('0.8')
    .expect(200)
    .then(() => showTestAchievement(app))
    .then(() => {
      expect(showAchievement).toHaveBeenCalledWith('Testeuse', '%USER% bidouille des trucs', 'berzingator2000', 0.8);
      done();
    });
});

test('if never set volume is 0.5', (done) => {
  showTestAchievement(app)
    .then(() => {
      expect(showAchievement).toHaveBeenCalledWith('Testeuse', '%USER% bidouille des trucs', 'berzingator2000', 0.5);
      done();
    });
});

test('GET /achievement_volume works', (done) => {
  getVolume()
    .then((response) => {
      expect(response.body.volume).toBe(0.5);
      return postVolume(0.8);
    })
    .then(getVolume)
    .then((response) => {
      expect(response.body.volume).toBe(0.8);
      done();
    });
});

test('bad request on POST /change_achievement_volume with invalid volume', () =>
  postVolume(0).expect(422)
    .then(() => postVolume(50).expect(422))
    .then(() => postVolume('abcd').expect(422)));

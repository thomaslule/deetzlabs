const { setup, postMessage, postAchievement } = require('./util');

let closet; let sendChatMessage;
beforeEach(() => {
  ({ closet, sendChatMessage } = setup());
});

test('!succès with 0 achievement', (done) => {
  postMessage(closet, '!succès')
    .then(() => new Promise(setImmediate))
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Someone n\'a pas encore de succès, déso.');
      done();
    });
});

test('!succès with 1 achievement', (done) => {
  postAchievement(closet, 'gravedigger')
    .then(() => postMessage(closet, '!succès'))
    .then(() => new Promise(setImmediate))
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Bravo Someone pour tes succès : Fossoyeuse !');
      done();
    });
});

test('!succès with 2 achievement', (done) => {
  postAchievement(closet, 'gravedigger')
    .then(() => postAchievement(closet, 'swedish'))
    .then(() => postMessage(closet, '!succès'))
    .then(() => new Promise(setImmediate))
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Bravo Someone pour tes succès : Fossoyeuse, Suédois LV1 !');
      done();
    });
});

test('!succès reads only caller achievements', (done) => {
  postAchievement(closet, 'gravedigger')
    .then(() => postAchievement(closet, 'swedish', 'other'))
    .then(() => postMessage(closet, '!succès'))
    .then(() => new Promise(setImmediate))
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Bravo Someone pour tes succès : Fossoyeuse !');
      done();
    });
});

test('!succes works too', (done) => {
  postMessage(closet, '!succes')
    .then(() => new Promise(setImmediate))
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Someone n\'a pas encore de succès, déso.');
      done();
    });
});


const { setup, postMessage, postAchievement } = require('./util');

let closet; let sendChatMessage;
beforeEach(() => {
  ({ closet, sendChatMessage } = setup());
});

test('!achievements with 0 achievement', (done) => {
  postMessage(closet, '!achievements')
    .then(() => new Promise(setImmediate))
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Someone doesn\'t have any achievement but their time will come!');
      done();
    });
});

test('!achievements with 1 achievement', (done) => {
  postAchievement(closet, 'cheerleader')
    .then(() => postMessage(closet, '!achievements'))
    .then(() => new Promise(setImmediate))
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Congratulations Someone for your achievements: Cheerleader');
      done();
    });
});

test('!achievements with 2 achievement', (done) => {
  postAchievement(closet, 'cheerleader')
    .then(() => postAchievement(closet, 'testing'))
    .then(() => postMessage(closet, '!achievements'))
    .then(() => new Promise(setImmediate))
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Congratulations Someone for your achievements: Cheerleader, Testing');
      done();
    });
});

test('!achievements reads only caller achievements', (done) => {
  postAchievement(closet, 'cheerleader')
    .then(() => postAchievement(closet, 'testing', 'other'))
    .then(() => postMessage(closet, '!achievements'))
    .then(() => new Promise(setImmediate))
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Congratulations Someone for your achievements: Cheerleader');
      done();
    });
});

test('!success works too', (done) => {
  postMessage(closet, '!success')
    .then(() => new Promise(setImmediate))
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Someone doesn\'t have any achievement but their time will come!');
      done();
    });
});

test('can customize !achievements command', (done) => {
  const setupObj = setup({
    achievements_command: {
      isCommand: message => message === '!medals',
      answer: 'Congratulations %USER% for your medals: %ACHIEVEMENTS%',
      answer_none: '%USER% doesn\'t have any medal but their time will come!',
    },
  });
  postAchievement(setupObj.closet, 'cheerleader')
    .then(() => postMessage(setupObj.closet, '!medals'))
    .then(() => new Promise(setImmediate))
    .then(() => {
      expect(setupObj.sendChatMessage).toHaveBeenCalledWith('Congratulations Someone for your medals: Cheerleader');
      done();
    });
});

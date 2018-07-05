const { setup, postMessage } = require('./util');

let closet; let sendChatMessage;
beforeEach(() => {
  ({ closet, sendChatMessage } = setup());
});

test('send its commands if someone type !commands', (done) => {
  postMessage(closet, '!commands')
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Say !achievements to see your current achievements');
      done();
    });
});

test('doesnt send anything if its !commands followed by something', (done) => {
  postMessage(closet, '!commands add truc bidule')
    .then(() => {
      expect(sendChatMessage).not.toHaveBeenCalled();
      done();
    });
});

test('can customize !commands command', (done) => {
  const setupObj = setup({
    commands_command: {
      isCommand: message => message === '!komands',
      answer: 'wat?',
    },
  });
  postMessage(setupObj.closet, '!komands')
    .then(() => {
      expect(setupObj.sendChatMessage).toHaveBeenCalledWith('wat?');
      done();
    });
});

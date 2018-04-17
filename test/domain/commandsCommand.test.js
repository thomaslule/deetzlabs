const { setup, postMessage } = require('./util');

let closet; let sendChatMessage;
beforeEach(() => {
  ({ closet, sendChatMessage } = setup());
});

test('send its commands if someone type !commands', (done) => {
  postMessage(closet, '!commands')
    .then(() => {
      expect(sendChatMessage).toHaveBeenCalledWith('Moi j\'ai qu\'une commande c\'est !succès');
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

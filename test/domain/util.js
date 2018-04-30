const configureCloset = require('../../src/domain');
const { configureLogger } = require('../../src/logger');
const config = require('../config');

const setup = (options = {}) => {
  configureLogger(config);
  const showAchievement = jest.fn();
  const sendChatMessage = jest.fn();
  const closet = configureCloset({
    showAchievement,
    sendChatMessage,
    achievements: config.achievements,
    achievements_command: config.achievements_command,
    commands_command: config.commands_command,
    closetOptions: {},
    ...options,
  });
  return {
    closet, showAchievement, sendChatMessage,
  };
};

const postAchievement = async (closet, achievement, viewer = 'someone') => {
  await closet.handleCommand('viewer', viewer, 'giveAchievement', { achievement });
};

const expectAchievement = async (showAchievement, achievement, text = expect.any(String)) => {
  await new Promise(setImmediate);
  expect(showAchievement).toHaveBeenCalledWith(
    achievement,
    text,
    expect.any(String), // viewer name
    expect.any(Number), // volume
  );
};

const expectNoAchievement = async (showAchievement) => {
  await new Promise(setImmediate);
  expect(showAchievement).not.toHaveBeenCalled();
};

const postMessage = async (closet, message = 'yo') => {
  await closet.handleCommand('viewer', 'someone', 'chatMessage', {
    message,
    displayName: 'Someone',
  });
};

const cheer = async (closet) => {
  await closet.handleCommand('viewer', 'someone', 'cheer', {
    message: 'hop cheer100',
    amount: 100,
    displayName: 'Someone',
  });
};

const beginStream = closet =>
  closet.handleCommand('stream', 'stream', 'begin', { game: 'Tetris' });


const endStream = closet =>
  closet.handleCommand('stream', 'stream', 'end');

module.exports = {
  setup,
  postAchievement,
  expectAchievement,
  expectNoAchievement,
  postMessage,
  cheer,
  beginStream,
  endStream,
};

module.exports = {
  db_url: 'postgresql://postgres:admin@localhost:5432/deetzlabs_test',
  bot_name: 'Berzingator2000',
  protect_api: false,
  log_to_console: false,
  log_to_file: true,
  achievements: {
    testing: {
      name: 'Testing',
      text: '%USER% tests something',
      reducer: () => ({ distribute: false }),
    },
    cheerleader: {
      name: 'Cheerleader',
      text: 'Thank you %USER%!',
      reducer: (state, event) => {
        if (event.aggregate === 'viewer' && (event.type === 'cheered')) {
          return { distribute: true };
        }
        return { distribute: false };
      },
    },
  },
  achievements_command: {
    command: '!achievements',
    answer: 'Congratulations %USER% for your achievements: %ACHIEVEMENTS%',
    answer_none: '%USER% doesn\'t have any achievement but their time will come!',
  },
  commands_command: {
    command: '!commands',
    answer: 'Say !achievements to see your current achievements',
  },
};

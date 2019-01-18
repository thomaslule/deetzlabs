const isGG = event => event.type === "sent-chat-message" && event.message.gg;

module.exports = {
  db_url: "postgresql://postgres:admin@localhost:5432/deetzlabs_test",
  protect_api: false,
  log_level: "debug",
  log_to_file: false,
  log_to_console: false,
  messageToObject: message => ({
    commandsCommand: message === "!commands" ? true : undefined,
    achievementsCommand: message === "!achievements" ? true : undefined,
    gg: message.startsWith("gg") ? true : undefined
  }),
  achievements: {
    cheerleader: {
      name: "Cheerleader",
      text: "Thank you %USER%!",
      description: "Automatically distributed when a viewer sends bits",
      distributeWhen: (state, event) => event.type === "cheered"
    },
    supporter: {
      name: "Supporter",
      text: "Thank you %USER%!",
      description: "Automatically distributed when a viewer says gg 5 times",
      reducer: (state = 0, event) => (isGG(event) ? state + 1 : state),
      distributeWhen: (state, event) => isGG(event) && state >= 5
    }
  },
  commands: [
    {
      when: event =>
        event.type === "sent-chat-message" && event.message.commandsCommand,
      say: () => "Say !achievements to see your current achievements"
    },
    {
      when: event =>
        event.type === "sent-chat-message" && event.message.achievementsCommand,
      say: ({ viewerName, viewerAchievements, options }) => {
        const achievements = viewerAchievements
          .map(a => options.achievements[a].name)
          .join(", ");
        return viewerAchievements.length === 0
          ? `${viewerName} doesn't have any achievement but their time will come!`
          : `Congratulations ${viewerName} for your achievements: ${achievements}`;
      }
    }
  ]
};

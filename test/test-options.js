const isGG = (event) => event.type === "sent-chat-message" && event.message.gg;

module.exports = {
  protect_api: false,
  log_to_file: false,
  messageToObject: (message) => ({
    commandsCommand: message === "!commands" ? true : undefined,
    achievementsCommand: message === "!achievements" ? true : undefined,
    gg: message.startsWith("gg") ? true : undefined,
  }),
  achievements: {
    cheerleader: {
      name: "Cheerleader",
      text: "Thank you %USER%!",
      distributeWhen: (state, event) => event.type === "cheered",
    },
    supporter: {
      name: "Supporter",
      text: "Thank you %USER%!",
      reducer: (state = 0, event) => isGG(event) ? state + 1 : state,
      distributeWhen: (state, event) => isGG(event) && state >= 5,
    },
  },
}

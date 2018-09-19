const defaultOptions = {
  port: 3100,
  db_url: "postgresql://postgres:admin@localhost:5432/deetzlabs",
  channel: "",
  client_id: "",
  client_secret: "",
  streamer_token: "",
  bot_name: "",
  bot_token: "",
  streamlabs_socket_token: "",
  secret: "",
  self_url: "http://localhost",
  webhook_port: 3333,
  achievements_command: {
    isCommand: (message: string) => message === "!achievements",
    answer: "Congratulations %USER% for your achievements: %ACHIEVEMENTS%",
    answer_none: "%USER% doesn't have any achievement but their time will come!",
  },
  commands_command: {
    isCommand: (message: string) => message === "!commands",
    answer: "Say !achievements to see your current achievements",
  },
  protect_api: true,
  logins: {
    test: "n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=", // test
  },
  log_to_console: true,
  log_to_file: true,
  achievements: {
    testing: {
      name: "Testing",
      text: "%USER% tests something",
      reducer: () => ({ distribute: false }),
    },
  },
  widgets_folder: undefined,
};

export function getOptions(providedOptions: any = {}) {
  return { ...defaultOptions, ...providedOptions };
}

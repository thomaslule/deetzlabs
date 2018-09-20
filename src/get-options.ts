import { Event, Reducer } from "es-objects";
import { Dictionary } from "lodash";
import { Obj } from "./util";

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
  messageToObject: (message: string) => ({
    commandsCommand: message === "!commands" ? true : undefined,
    achievementsCommand: message === "!achievements" ? true : undefined,
  }),
  achievements_answer: "Congratulations %USER% for your achievements: %ACHIEVEMENTS%",
  achievements_answer_none: "%USER% doesn't have any achievement but their time will come!",
  commands_answer: "Say !achievements to see your current achievements",
  protect_api: true,
  logins: {
    test: "n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=", // test
  },
  log_to_console: true,
  log_to_file: true,
  achievements: {},
  widgets_folder: undefined,
};

export function getOptions(providedOptions: Obj = {}): Options {
  return { ...defaultOptions, ...providedOptions };
}

export interface Options {
  achievements: Dictionary<AchievementOption>;
  achievements_answer: string;
  achievements_answer_none: string;
  commands_answer: string;
  [x: string]: any;
}

interface AchievementOption {
  name: string;
  text: string;
  reducer: Reducer<any>;
  distributeWhen: (state: any, event: Event) => boolean;
}

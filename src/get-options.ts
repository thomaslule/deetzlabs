import { Event, Reducer } from "es-objects";
import { Dictionary } from "lodash";
import { Obj } from "./util";

const defaultOptions = {
  port: 3100,
  self_url: "http://localhost",
  webhook_port: 3333,
  db_url: "postgresql://postgres:admin@localhost:5432/deetzlabs",
  channel: "",
  client_id: "",
  client_secret: "",
  bot_name: "",
  bot_token: "",
  streamlabs_socket_token: "",
  secret: "",
  protect_api: true,
  logins: {
    test: "n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=", // test
  },
  log_to_console: true,
  log_to_file: true,
  widgets_folder: undefined,
  achievements: {},
  messageToObject: (message: string) => ({
    commandsCommand: message === "!commands" ? true : undefined,
    achievementsCommand: message === "!achievements" ? true : undefined,
  }),
  achievements_answer: "Congratulations %USER% for your achievements: %ACHIEVEMENTS%",
  achievements_answer_none: "%USER% doesn't have any achievement but their time will come!",
  commands_answer: "Say !achievements to see your current achievements",
};

export function getOptions(providedOptions: Partial<Options> = {}): Options {
  return { ...defaultOptions, ...providedOptions };
}

export interface Options {
  port: number;
  self_url: string;
  webhook_port: number;
  db_url: string;
  channel: string;
  client_id: string;
  client_secret: string;
  bot_name: string;
  bot_token: string;
  streamlabs_socket_token: string;
  secret: string;
  protect_api: boolean;
  logins: Dictionary<string>;
  log_to_console: boolean;
  log_to_file: boolean;
  widgets_folder: string | undefined;
  achievements: Dictionary<AchievementOption>;
  messageToObject: (message: string) => Obj;
  achievements_answer: string;
  achievements_answer_none: string;
  commands_answer: string;
}

interface AchievementOption {
  name: string;
  text: string;
  reducer?: Reducer<any>;
  distributeWhen: (state: any, event: Event) => boolean;
}

import { Event, Reducer } from "es-objects";
import { Dictionary } from "lodash";
import { Obj } from "./util";

const defaultOptions: Options = {
  port: 3100,
  self_url: "http://localhost",
  db_url: "postgresql://postgres:admin@localhost:5432/deetzlabs",
  channel: "",
  client_id: "",
  client_secret: "",
  bot_name: "",
  bot_token: "",
  protect_api: true,
  logins: [],
  log_level: "info",
  log_to_console: true,
  log_to_file: true,
  widgets_folder: undefined,
  achievements: {},
  messageToObject: () => ({}),
  commands: [],
};

export interface Options {
  port: number;
  self_url: string;
  db_url: string;
  channel: string;
  client_id: string;
  client_secret: string;
  bot_name: string;
  bot_token: string;
  protect_api: boolean;
  logins: string[];
  log_level: string;
  log_to_console: boolean;
  log_to_file: boolean;
  widgets_folder: string | undefined;
  achievements: Dictionary<AchievementOption>;
  messageToObject: (message: string) => Obj;
  commands: Command[];
}

interface AchievementOption {
  name: string;
  text: string;
  description: string;
  reducer?: Reducer<any>;
  distributeWhen: (state: any, event: Event) => boolean;
}

interface Command {
  when: (event: Event) => boolean;
  say: (inputs: CommandInputs) => string | undefined;
}

interface CommandInputs {
  event: Event;
  viewerName: string;
  viewerAchievements: string[];
  options: Options;
}

export function getOptions(providedOptions: Partial<Options> = {}): Options {
  return { ...defaultOptions, ...providedOptions };
}

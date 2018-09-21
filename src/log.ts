import { format } from "logform";
import { createLogger, transports } from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import { Options } from "./get-options";

export const log = createLogger();

export function configureLog(options: Options) {
  log.configure({
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.splat(),
      format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
    ),
  });
  if (options.log_to_console) {
    log.add(new transports.Console());
  }
  if (options.log_to_file) {
    log.add(new DailyRotateFile({
      dirname: "log",
      filename: "deetzlabs-%DATE%.log",
    }));
  }
}

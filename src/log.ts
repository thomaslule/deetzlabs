import { format } from "logform";
import * as winston from "winston";
import { createLogger, transports } from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import { Options } from "./options";

const errorStackToMessage = winston.format(info => {
  if (info instanceof Error && info.stack) {
    info.message = info.stack;
  }
  return info;
});

export const log = createLogger();

export function configureLog(options: Options) {
  log.configure({
    level: options.log_level,
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.splat(),
      errorStackToMessage(),
      format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    silent: !options.log_to_console && !options.log_to_file
  });
  if (options.log_to_console) {
    log.add(new transports.Console());
  }
  if (options.log_to_file) {
    log.add(
      new DailyRotateFile({
        dirname: "log",
        filename: "deetzlabs-%DATE%.log"
      })
    );
  }
}

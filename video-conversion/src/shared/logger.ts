import path from 'path';
import util from 'util';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, label, timestamp, printf, colorize } = format;

const infiConsoleFormat = printf(({ level, message, label, timestamp }) => {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // If message is an object, convert it to a string using util.inspect
  // If message is an object, convert it to a string using util.inspect
  if (typeof message === 'object') {
    message = util.inspect(message, null, Infinity, true);
  }

  return `[${date.toDateString()} ${hour}:${minutes}:${seconds} ] [${label}] ${level}: ${message}`;
});
const eorrorConsoleFormat = printf(({ level, message, label, timestamp }) => {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // If message is an object, convert it to a string using util.inspect
  if (typeof message === 'object') {
    message = util.inspect(message, null, Infinity, true);
  }

  return `[${date.toDateString()} ${hour}:${minutes}:${seconds} ] [${label}] ${level}: ${message}`;
});

const myFormat = printf(({ level, message, label, timestamp }) => {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // If message is an object, convert it to a string using util.inspect
  if (typeof message === 'object') {
    message = util.inspect(message, null, Infinity, true);
  }

  return `[${date.toDateString()} ${hour}:${minutes}:${seconds} ] [${label}] ${level}: ${message}`;
});
const logger = createLogger({
  level: 'info',
  format: combine(label({ label: 'MERN' }), timestamp()),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.Console({ format: combine(colorize(), infiConsoleFormat) }),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        'logs',
        'winston',
        'successes',
        'MERN-%DATE%-success.log',
      ),
      datePattern: 'YYYY-DD-MM-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: myFormat,
    }),
  ],
});

const errorLogger = createLogger({
  level: 'info',
  format: combine(label({ label: 'MERN' }), timestamp(), myFormat),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.Console({
      format: combine(colorize(), eorrorConsoleFormat),
    }),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        'logs',
        'winston',
        'errors',
        'MERN-%DATE%-error.log',
      ),
      datePattern: 'YYYY-DD-MM-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: myFormat,
    }),
  ],
});

export { errorLogger, logger };

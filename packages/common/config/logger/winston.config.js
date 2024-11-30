import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import util from 'util';
import { config } from '../config.js';

const NAMES = {
  SERVER: '',
  PROJECT: config.SERVER_NAME,
};
const PROJECT_NAME = NAMES.PROJECT;
const logDir = 'logs'; // logs 디렉토리 하위에 로그 파일 저장
const { combine, timestamp, label, printf } = winston.format;

// Define log format
const logFormat = printf(({ level, message, label, timestamp, ...meta }) => {
  const extraArgs = meta[Symbol.for('splat')] || [];
  const formattedExtra = extraArgs
    .map((arg) => (typeof arg === 'object' ? util.inspect(arg, { depth: null }) : arg))
    .join(' '); // 배열이나 객체를 읽기 좋은 형태로 변환

  if (level === 'error') {
    const colorized = winston.format
      .colorize()
      .colorize(
        level,
        `${timestamp} [${label}] [${level.toUpperCase()}]: ${message} ${formattedExtra}`,
      );
    return colorized;
  } else {
    return `${timestamp} [${label}] [${level.toUpperCase()}]: ${message} ${formattedExtra}`; // 날짜 [시스템이름] 로그레벨 메세지
  }
});

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    label({ label: PROJECT_NAME + NAMES.SERVER }), // 어플리케이션 이름
    logFormat,
  ),
  transports: [
    // info 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: 'info', //* info 레벨 로그를 저장할 파일 설정 (info: 2 보다 높은 error: 0 와 warn: 1 로그들도 자동 포함해서 저장)
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: 30, // 30일치 로그 파일 저장
      zippedArchive: true,
    }),
    // error 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error', // error.log 파일은 /logs/error 하위에 저장
      filename: `%DATE%.error.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
    new winston.transports.Console(), // 콘솔에 로그 출력
  ],
  //* uncaughtException 발생시 파일 설정
  exceptionHandlers: [
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: `%DATE%.exception.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
    new winston.transports.Console(), // 콘솔에 로그 출력
  ],
});

/**
 * winston logger 생성
 * @param {String} serviceName 서비스명
 * @returns
 */
const createLogger = (serviceName) => {
  return winston.createLogger({
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      label({ label: serviceName }), // 어플리케이션 이름
      logFormat,
    ),
    transports: [
      // info 레벨 로그를 저장할 파일 설정
      new winstonDaily({
        level: 'info', //* info 레벨 로그를 저장할 파일 설정 (info: 2 보다 높은 error: 0 와 warn: 1 로그들도 자동 포함해서 저장)
        datePattern: 'YYYY-MM-DD',
        dirname: logDir,
        filename: `${serviceName}_%DATE%.log`,
        maxFiles: 30, // 30일치 로그 파일 저장
        zippedArchive: true,
      }),
      // error 레벨 로그를 저장할 파일 설정
      new winstonDaily({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/error', // error.log 파일은 /logs/error 하위에 저장
        filename: `${serviceName}_%DATE%.error.log`,
        maxFiles: 30,
        zippedArchive: true,
      }),
      new winston.transports.Console(), // 콘솔에 로그 출력
    ],
    //* uncaughtException 발생시 파일 설정
    exceptionHandlers: [
      new winstonDaily({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir,
        filename: `${serviceName}_%DATE%.exception.log`,
        maxFiles: 30,
        zippedArchive: true,
      }),
      new winston.transports.Console(), // 콘솔에 로그 출력
    ],
  });
};

export { logger, createLogger };

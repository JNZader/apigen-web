type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: string;
  data?: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLogLevel: LogLevel = import.meta.env.MODE === 'production' ? 'error' : 'debug';
let logHistory: LogEntry[] = [];

const MAX_LOG_HISTORY = 100;

export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

export function getLogHistory(): LogEntry[] {
  return [...logHistory];
}

export function clearLogHistory(): void {
  logHistory = [];
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
}

function formatLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: unknown,
): LogEntry {
  return {
    level,
    timestamp: new Date().toISOString(),
    message,
    context,
    data,
  };
}

function writeToConsole(entry: LogEntry): void {
  const consoleMethod = (() => {
    switch (entry.level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
    }
  })();

  const logMessage = entry.context ? `[${entry.context}] ${entry.message}` : entry.message;

  if (entry.data !== undefined) {
    consoleMethod(logMessage, entry.data);
  } else {
    consoleMethod(logMessage);
  }
}

export function debug(message: string, context?: string, data?: unknown): void {
  if (!shouldLog('debug')) return;

  const entry = formatLogEntry('debug', message, context, data);
  logHistory.push(entry);

  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift();
  }

  writeToConsole(entry);
}

export function info(message: string, context?: string, data?: unknown): void {
  if (!shouldLog('info')) return;

  const entry = formatLogEntry('info', message, context, data);
  logHistory.push(entry);

  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift();
  }

  writeToConsole(entry);
}

export function warn(message: string, context?: string, data?: unknown): void {
  if (!shouldLog('warn')) return;

  const entry = formatLogEntry('warn', message, context, data);
  logHistory.push(entry);

  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift();
  }

  writeToConsole(entry);
}

export function error(
  message: string,
  error?: Error | unknown,
  context?: string,
  data?: unknown,
): void {
  if (!shouldLog('error')) return;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const entry = formatLogEntry('error', `${message}: ${errorMessage}`, context, data);
  logHistory.push(entry);

  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift();
  }

  writeToConsole(entry);
}

export const logger = {
  debug,
  info,
  warn,
  error,
  setLogLevel,
  getLogLevel,
  getLogHistory,
  clearLogHistory,
};

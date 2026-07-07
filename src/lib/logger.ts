type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const logger = {
  log: (level: LogLevel, message: string, ...args: unknown[]) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (process.env.NODE_ENV !== 'production' || level === 'error' || level === 'warn') {
      switch (level) {
        case 'info':
          console.info(formattedMessage, ...args);
          break;
        case 'warn':
          console.warn(formattedMessage, ...args);
          break;
        case 'error':
          console.error(formattedMessage, ...args);
          break;
        case 'debug':
          console.debug(formattedMessage, ...args);
          break;
      }
    }
  },
  info: (message: string, ...args: unknown[]) => logger.log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => logger.log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => logger.log('error', message, ...args),
  debug: (message: string, ...args: unknown[]) => logger.log('debug', message, ...args),
};

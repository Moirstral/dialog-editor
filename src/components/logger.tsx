// utils/logger.ts
const isDev = process.env.NODE_ENV === "development";

const logger = {
  error: (message: string | any, ...args: any[]) => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message: string | any, ...args: any[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  info: (message: string | any, ...args: any[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, ...args);
    }
  },
};

export default logger;

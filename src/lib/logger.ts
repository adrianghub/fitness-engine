export const logger = {
  debug: (category: string, ...args: unknown[]) => {
    console.debug(`[${category}]`, ...args);
  },
  info: (category: string, ...args: unknown[]) => {
    console.info(`[${category}]`, ...args);
  },
  warn: (category: string, ...args: unknown[]) => {
    console.warn(`[${category}]`, ...args);
  },
  error: (category: string, ...args: unknown[]) => {
    console.error(`[${category}]`, ...args);
  },
};

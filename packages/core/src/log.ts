import pino from "pino";
import type { Config } from "./config";

export function createLogger(config: Config) {
  // Use pretty printing in development, plain JSON in production
  const isDev = process.env.NODE_ENV !== "production";
  
  if (isDev) {
    return pino({
      level: config.log.level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    });
  }
  
  return pino({
    level: config.log.level,
  });
}

export type Logger = ReturnType<typeof createLogger>;

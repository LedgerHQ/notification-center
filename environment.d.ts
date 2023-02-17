export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_URL: string;
      TELEGRAM_TOKEN: string;
      PORT?: string;
      MAX_TIME_DIFF?: string;
    }
  }
}

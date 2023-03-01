export {};

// This file is used to declare .env types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // General / common env variables
      USE_DOCKER?: string;
      TELEGRAM_TOKEN: string;
      MAX_TIME_DIFF?: string;

      // Local specific env variables
      LOCAL_DB_URL: string;
      LOCAL_PORT?: string;

      // Docker specific env variables
      MONGODB_USER: string;
      MONGODB_PASSWORD: string;
      MONGODB_DATABASE: string;
      MONGODB_LOCAL_PORT: string;
      MONGODB_DOCKER_PORT: string;
      NODE_LOCAL_PORT: string;
      NODE_DOCKER_PORT: string;
    }
  }
}

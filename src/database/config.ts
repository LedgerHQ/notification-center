const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  USE_DOCKER,
  LOCAL_DB_URL,
} = process.env;

export const DB_URL = USE_DOCKER
  ? `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`
  : LOCAL_DB_URL;

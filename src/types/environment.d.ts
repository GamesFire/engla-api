declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: string;
      APP_TYPE: string;
      CORS_ORIGIN: string;
      AUTH0_ISSUER_BASE_URL: string;
      AUTH0_AUDIENCE: string;
      LOG_LEVEL: string;
      LOG_DIR: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASS: string;
      DB_NAME: string;
      DB_DEFAULT_NAME: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      REDIS_PASS: string;
      REDIS_DB: string;
    }
  }
}

export {};

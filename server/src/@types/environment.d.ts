declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_LEVEL: string;
      NODE_ENV: string;
      PORT: number;
      POSTGRES_HOST: string;
      POSTGRES_PORT: number;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DATABASE: string;
      POSTGRES_URL: string;
      REDIS_HOST: string;
      REDIS_PORT: number;
      MEDIA_SOURCE: string;
      MEDIA_DESTINATION: string;
      MEDIA_TMP: string;
      MEDIA_LOGS: string;
      SHOULD_MOVE_FILES: boolean;
      GEO_PROVIDER: string;
      GEO_API_KEY: string;
      OBJECT_THRESHOLD: string;
    }
  }
}

export {};

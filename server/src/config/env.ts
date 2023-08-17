export const ENV = {
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3141,

  // Postgres
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,

  // Redis
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: Number(process.env.REDIS_PORT),
  REDIS_CONNECTION_TIMEOUT: process.env.REDIS_CONNECTION_TIMEOUT,

  // Volumes
  MEDIA_SOURCE: process.env.MEDIA_SOURCE,
  MEDIA_DESTINATION: process.env.MEDIA_DESTINATION,
  // MEDIA_ORIGINALS: process.env.MEDIA_ORIGINALS,
  MEDIA_TMP: process.env.MEDIA_TMP,
  LOGS: process.env.MEDIA_LOGS,

  SHOULD_MOVE_FILES: toBool(process.env.SHOULD_MOVE_FILES, false),

  ...(!process.env.GEO_PROVIDER && {
    USE_GEO: true,
    GEO_OPTIONS: {
      provider: process.env.GEO_PROVIDER,
      apiKey: process.env.GEO_API_KEY,
    },
  }),

  OBJECT_THRESHOLD: Number(process.env.OBJECT_THRESHOLD),
  FACE_THRESHOLD: Number(process.env.FACE_THRESHOLD),
} as const;

function toBool(value: unknown, _default?: boolean | undefined) {
  if (typeof value === undefined || value === undefined) {
    if (typeof _default === undefined || _default === undefined) {
      return false;
    } else {
      value = _default;
    }
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    let stringVal: string = value;

    stringVal = stringVal.trim();
    stringVal = stringVal.toLowerCase();

    return ["true", "1"].indexOf(stringVal) >= 0;
  }

  if (typeof value === "number") {
    return value > 0 || value < 0;
  }
}

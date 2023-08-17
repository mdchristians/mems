import type { Config } from "@jest/types";

const tsConfigFile = new URL("./tsconfig.jest.json", import.meta.url).pathname;

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
  setupFiles: ["dotenv/config"],
  transform: {
    "^.+\\.(ts)$": ["ts-jest", { tsconfig: tsConfigFile }],
  },
  testMatch: ["<rootDir>/src/**/*.spec.ts"],
};

export default config;

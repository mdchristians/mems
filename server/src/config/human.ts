import Human from "@vladmandic/human";

// https://github.com/vladmandic/human/blob/main/src/config.ts#L373
const config = {
  async: true,
  debug: false,
  modelBasePath: "file://./src/config/models/",
  filter: { enabled: false },
  gesture: { enabled: false },
  body: { enabled: false },
  hand: { enabled: false },
  face: {
    enabled: true,
    detector: {
      maxDetected: 100,
      enabled: true,
      modelPath: "blazeface.json",
      rotation: true,
      return: true,
    },
    mesh: { enabled: true },
    description: { enabled: true, modelPath: "faceres-deep.json" },
    age: { enabled: false },
    gender: { enabled: false },
    embedding: { enabled: false },
  },
  object: {
    enabled: true,
    modelPath: "mb3-centernet.json",
    minConfidence: 0.2,
    iouThreshold: 0.4,
    maxDetected: 10,
    skipFrames: 99,
    skipTime: 2000,
  },
};

export const human = new Human(config);

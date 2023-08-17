import { v4 as uuidv4 } from "uuid";
import kebabCase from "lodash/kebabCase";
import { prisma } from "@mems/db";
import { logger } from "@/core";

export type GetOrCreateRecognitionOptionParams = {
  name: string;
  facePath?: string;
};

export type GetOrCreateRecognitionOptionResponse = {
  id: string;
  name: string;
};

export async function getOrCreateRecognitionOption({
  name,
  facePath,
}: GetOrCreateRecognitionOptionParams): Promise<GetOrCreateRecognitionOptionResponse> {
  if (!name) {
    throw new Error("getOrCreateRecognitionOption requires name!");
  }

  const recognitionResults = await prisma.faces.findMany({
    where: {
      name: name.toLowerCase(),
    },
  });

  if (recognitionResults.length === 0) {
    if (facePath) {
      const recognition = {
        id: uuidv4(),
        name: name.toLowerCase(),
        cover_photo: facePath,
      };

      return prisma.faces
        .create({
          data: recognition,
        })
        .then(() => {
          return { id: recognition.id, name: name.toLowerCase() };
        })
        .catch((err) => {
          logger.error(`Error inserting new recognition option`);
          throw new Error(err);
        });
    } else {
      throw new Error("Missing cover photo face path for a new face");
    }
  } else {
    return recognitionResults[0];
  }
}

export async function getOrCreateObjectOption(name: string) {
  if (!name) {
    throw new Error("getOrCreateObjectOption requires name!");
  }

  const recognitionResults = await prisma.objects.findMany({
    where: {
      name,
    },
  });

  if (recognitionResults.length === 0) {
    const recognition = {
      id: uuidv4(),
      name: name.toLowerCase(),
    };

    return prisma.objects
      .create({
        data: recognition,
      })
      .then(() => {
        return { id: recognition.id, name: name.toLowerCase() };
      })
      .catch((err) => {
        logger.error(`Error inserting new recognition option`);
        throw new Error(err);
      });
  } else {
    return recognitionResults[0];
  }
}

export async function getOrCreateLocationOption(location: string) {
  if (!location) {
    throw new Error("getOrCreateLocationOption requires location!");
  }

  const recognitionResults = await prisma.locations.findMany({
    where: {
      location,
    },
  });

  if (recognitionResults.length === 0) {
    const recognition = {
      id: uuidv4(),
      location: location.toLowerCase(),
    };

    return prisma.locations
      .create({
        data: recognition,
      })
      .then(() => {
        return { id: recognition.id, location: location.toLowerCase() };
      })
      .catch((err) => {
        logger.error(`Error inserting new recognition option`);
        throw new Error(err);
      });
  } else {
    return recognitionResults[0];
  }
}

export async function getOrCreateTagOption(tag: string, type: "album" | "media") {
  if (!tag || !type) {
    throw new Error("getOrCreateTagOption requires tag and type!");
  }

  const value = kebabCase(tag);

  const tagResults = await prisma.tags.findMany({
    where: {
      value,
    },
  });

  if (tagResults.length === 0) {
    const newTag = {
      id: uuidv4(),
      value,
      tag,
      type,
    };

    return prisma.tags
      .create({
        data: newTag,
      })
      .then(() => {
        return { id: newTag.id, tag };
      })
      .catch((err) => {
        logger.error(`Error inserting new recognition option`);
        throw new Error(err);
      });
  } else {
    return tagResults[0];
  }
}

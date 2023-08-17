import { tagExtractor } from "./tag-extractor";

const stub = {
  ShutterSpeed: undefined,
  ExposureTime: "1/8",
  ShutterSpeedValue: "1/16",
  Aperture: "23",
  FNumber: "24",
  ApertureValue: "25",
};

describe("tagExtractor", () => {
  it("Should return the first defined value", () => {
    const keys = ["ShutterSpeed", "ExposureTime", "ShutterSpeedValue"];
    const result = tagExtractor(stub, keys);
    expect(result).toBe(stub.ExposureTime);
  });

  it("Should return the first defined value in order", () => {
    const keys = ["ShutterSpeedValue", "ShutterSpeed", "ExposureTime"];
    const result = tagExtractor(stub, keys);
    expect(result).toBe(stub.ShutterSpeedValue);
  });

  it("should process the value with a transformer if applied", () => {
    const keys = ["Aperture", "FNumber", "ApertureValue"];
    const transformer = (a: string) => Number(a);
    const result = tagExtractor(stub, keys, transformer);
    expect(result).toBe(23);
  });

  it("should return null of no value is found", () => {
    const keys = ["Height", "Length"];
    const result = tagExtractor(stub, keys);
    expect(result).toBe(null);
  });
});

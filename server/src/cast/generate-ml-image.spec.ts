import { shouldGenerateMlImage } from "./generate-ml-image";

describe("shouldGenerateMlImage", () => {
  it("should return true if the image is non-standard", () => {
    const value = shouldGenerateMlImage(1, "heic");
    expect(value).toBeTruthy();
  });

  it("should return true if the image is too big", () => {
    const value = shouldGenerateMlImage(20, "jpg");
    expect(value).toBeTruthy();
  });

  it("should return false if the image is okay", () => {
    const value = shouldGenerateMlImage(1, "jpg");
    expect(value).toBeFalsy();
  });
});

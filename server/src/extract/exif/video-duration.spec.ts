import { getDurationInSeconds } from "./video-duration";

describe("getDurationInSeconds", () => {
  it("should parse a string and round correctly", () => {
    const result = getDurationInSeconds("14:10");
    expect(result).toBe(14.1);
  });

  it("should parse a string decimal and round correctly", () => {
    const result = getDurationInSeconds("0.265");
    expect(result).toBe(0.27);
  });

  it("should parse a number and round correctly", () => {
    const result = getDurationInSeconds(19.5342);
    expect(result).toBe(19.53);
  });
});

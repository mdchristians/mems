import { toBool } from "./bools";

describe("toBool", () => {
  describe("with defaults", () => {
    it("should should return false when both value and default are undefined", () => {
      const bool = toBool(undefined);
      expect(bool).toBe(false);
    });

    it("should should return true when value is undefined but default is true", () => {
      const bool = toBool(undefined, true);
      expect(bool).toBe(true);
    });
  });

  describe("strings", () => {
    it("can recognize strings as true", () => {
      const bool = toBool("true");
      expect(bool).toBe(true);
    });

    it("can recognize number strings as true", () => {
      const bool = toBool("1");
      expect(bool).toBe(true);
    });

    it("can recognize strings as false", () => {
      const bool = toBool("false");
      expect(bool).toBe(false);
    });

    it("can recognize number strings as false", () => {
      const bool = toBool("0");
      expect(bool).toBe(false);
    });
  });

  describe("numbers", () => {
    it("can recognize numbers as true", () => {
      const bool = toBool(1);
      expect(bool).toBe(true);
    });

    it("can recognize numbers as false", () => {
      const bool = toBool(0);
      expect(bool).toBe(false);
    });
  });

  describe("booleans", () => {
    it("can recognize true as true", () => {
      const bool = toBool(true);
      expect(bool).toBe(true);
    });

    it("can recognize false as false", () => {
      const bool = toBool(false);
      expect(bool).toBe(false);
    });
  });
});

import { truncateNumber, decimalToSeconds } from "./numbers";

describe("utils > numbers", () => {
  describe("truncateNumber", () => {
    it("should return a truncated number", () => {
      const truncated = truncateNumber(50.12345679, 5);

      expect(truncated).toBe(50.12345);
    });
  });

  describe("decimalToSeconds", () => {
    it("should return formatted minutes and seconds", () => {
      const time = decimalToSeconds("12.766667");

      expect(time).toBe("12:46");
    });

    it("should return formatted hours, minutes and seconds", () => {
      const time = decimalToSeconds("4:07.340521");

      expect(time).toBe("4:07:20");
    });
  });
});

import { debounce, formatDate, truncate, cn } from "@/lib/utils";

describe("utils", () => {
  describe("debounce", () => {
    jest.useFakeTimers();

    it("should debounce function calls", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should reset timer on subsequent calls", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      jest.advanceTimersByTime(50);
      debouncedFn();
      jest.advanceTimersByTime(50);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan.*15.*2024/);
    });
  });

  describe("truncate", () => {
    it("should truncate long strings", () => {
      const longString = "a".repeat(100);
      const truncated = truncate(longString, 50);
      expect(truncated.length).toBe(53); // 50 + "..."
      expect(truncated).toEndWith("...");
    });

    it("should not truncate short strings", () => {
      const shortString = "Hello";
      const result = truncate(shortString, 50);
      expect(result).toBe("Hello");
    });
  });

  describe("cn", () => {
    it("should merge class names", () => {
      const result = cn("class1", "class2");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });

    it("should handle conditional classes", () => {
      const result = cn("base", false && "hidden", "visible");
      expect(result).not.toContain("hidden");
      expect(result).toContain("visible");
    });
  });
});

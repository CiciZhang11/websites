import { pagesAPI, blocksAPI, searchAPI } from "@/lib/api";

// Mock fetch
global.fetch = jest.fn();

describe("API Client", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => "test-token");
  });

  describe("pagesAPI", () => {
    it("should list pages", async () => {
      const mockPages = [{ id: "1", title: "Test Page" }];
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ pages: mockPages }),
      });

      const result = await pagesAPI.list();
      expect(result.pages).toEqual(mockPages);
      expect(fetch).toHaveBeenCalledWith("/api/pages", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      });
    });

    it("should create a page", async () => {
      const mockPage = { id: "1", title: "New Page" };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ page: mockPage }),
      });

      const result = await pagesAPI.create({ title: "New Page" });
      expect(result.page).toEqual(mockPage);
      expect(fetch).toHaveBeenCalledWith(
        "/api/pages",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "New Page" }),
        })
      );
    });

    it("should handle errors", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Error occurred" }),
      });

      await expect(pagesAPI.list()).rejects.toThrow("Error occurred");
    });
  });

  describe("blocksAPI", () => {
    it("should list blocks for a page", async () => {
      const mockBlocks = [{ id: "1", type: "paragraph", content: "[]" }];
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ blocks: mockBlocks }),
      });

      const result = await blocksAPI.list("page-id");
      expect(result.blocks).toEqual(mockBlocks);
    });
  });

  describe("searchAPI", () => {
    it("should search pages and blocks", async () => {
      const mockResults = [
        { type: "page", id: "1", title: "Test Page" },
      ];
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: mockResults }),
      });

      const result = await searchAPI.search("test");
      expect(result.results).toEqual(mockResults);
    });
  });
});

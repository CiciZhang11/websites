"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, FileText, Clock } from "lucide-react";
import { Page } from "@/types/notion";
import { PageTree } from "./PageTree";
import { SearchModal } from "../search/SearchModal";
import { pagesAPI, recentlyViewedAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentPageId?: string;
  onPageSelect: (pageId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPageId,
  onPageSelect,
}) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Page[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pagesResponse, recentResponse] = await Promise.all([
        pagesAPI.list(),
        recentlyViewedAPI.list(),
      ]);
      setPages(pagesResponse.pages);
      setRecentlyViewed(recentResponse.pages);
    } catch (error) {
      console.error("Failed to load sidebar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async () => {
    try {
      const response = await pagesAPI.create({
        title: "Untitled",
      });
      await loadData();
      onPageSelect(response.page.id);
    } catch (error) {
      console.error("Failed to create page:", error);
    }
  };

  const buildPageTree = (pages: Page[], parentId: string | null = null): Page[] => {
    return pages
      .filter((page) => page.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map((page) => ({
        ...page,
        children: buildPageTree(pages, page.id),
      }));
  };

  const pageTree = buildPageTree(pages);

  return (
    <>
      <div className="notion-sidebar">
        <div className="p-4 space-y-4">
          {/* Search */}
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="text-gray-500">Search</span>
            <span className="ml-auto text-xs text-gray-400">Ctrl+K</span>
          </Button>

          {/* New Page */}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleCreatePage}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Button>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                <Clock className="h-3 w-3" />
                Recently Viewed
              </div>
              <div className="mt-1">
                {recentlyViewed.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => onPageSelect(page.id)}
                    className={`
                      w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-100
                      flex items-center gap-2
                      ${currentPageId === page.id ? "bg-blue-50 text-blue-600" : ""}
                    `}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{page.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Page Tree */}
          <div>
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
              Pages
            </div>
            <div className="mt-1">
              {loading ? (
                <div className="px-2 py-4 text-sm text-gray-500">Loading...</div>
              ) : pageTree.length === 0 ? (
                <div className="px-2 py-4 text-sm text-gray-500">
                  No pages yet. Create one to get started!
                </div>
              ) : (
                <PageTree
                  pages={pageTree}
                  currentPageId={currentPageId}
                  onPageSelect={onPageSelect}
                  depth={0}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onPageSelect={(pageId) => {
          setSearchOpen(false);
          onPageSelect(pageId);
        }}
      />
    </>
  );
};

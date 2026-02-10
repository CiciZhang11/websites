"use client";

import React, { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, FileText, MoreHorizontal } from "lucide-react";
import { Page } from "@/types/notion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pagesAPI } from "@/lib/api";

interface LazyPageTreeProps {
  pages: Page[];
  currentPageId?: string;
  onPageSelect: (pageId: string) => void;
  depth: number;
  maxDepth?: number;
  initialExpanded?: Set<string>;
}

export const LazyPageTree: React.FC<LazyPageTreeProps> = ({
  pages,
  currentPageId,
  onPageSelect,
  depth,
  maxDepth = 10,
  initialExpanded = new Set(),
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);
  const [loadedPages, setLoadedPages] = useState<Set<string>>(new Set());

  const toggleExpand = (pageId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
        // Mark as loaded when expanded
        setLoadedPages((prev) => new Set(prev).add(pageId));
      }
      return next;
    });
  };

  const handleDelete = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this page?")) {
      try {
        await pagesAPI.delete(pageId);
      } catch (error) {
        console.error("Failed to delete page:", error);
      }
    }
  };

  const handleCreateChild = async (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await pagesAPI.create({
        title: "Untitled",
        parentId,
      });
      setExpanded((prev) => new Set(prev).add(parentId));
      setLoadedPages((prev) => new Set(prev).add(parentId));
      onPageSelect(response.page.id);
    } catch (error) {
      console.error("Failed to create child page:", error);
    }
  };

  // Memoize children to avoid unnecessary re-renders
  const childrenMap = useMemo(() => {
    const map = new Map<string, Page[]>();
    pages.forEach((page) => {
      const parentId = page.parentId || "root";
      if (!map.has(parentId)) {
        map.set(parentId, []);
      }
      map.get(parentId)!.push(page);
    });
    return map;
  }, [pages]);

  if (depth >= maxDepth) {
    return null;
  }

  const rootPages = childrenMap.get("root") || [];
  const sortedPages = rootPages.sort((a, b) => a.order - b.order);

  return (
    <div>
      {sortedPages.map((page) => {
        const children = childrenMap.get(page.id) || [];
        const hasChildren = children.length > 0;
        const isExpanded = expanded.has(page.id);
        const isSelected = currentPageId === page.id;
        const shouldLoadChildren = isExpanded && loadedPages.has(page.id);

        return (
          <div key={page.id}>
            <div
              className={`
                flex items-center gap-1 px-2 py-1.5 rounded text-sm
                hover:bg-gray-100 cursor-pointer group
                ${isSelected ? "bg-blue-50 text-blue-600" : ""}
              `}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => onPageSelect(page.id)}
            >
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(page.id);
                  }}
                  className="p-0.5 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              ) : (
                <div className="w-4" />
              )}
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate flex-1">{page.title}</span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="opacity-0 group-hover:opacity-100 p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={(e) => handleCreateChild(page.id, e)}
                  >
                    Add sub-page
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => handleDelete(page.id, e)}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {hasChildren && shouldLoadChildren && (
              <LazyPageTree
                pages={pages}
                currentPageId={currentPageId}
                onPageSelect={onPageSelect}
                depth={depth + 1}
                maxDepth={maxDepth}
                initialExpanded={expanded}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

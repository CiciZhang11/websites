"use client";

import React, { useState } from "react";
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

interface PageTreeProps {
  pages: Page[];
  currentPageId?: string;
  onPageSelect: (pageId: string) => void;
  depth: number;
  maxDepth?: number;
}

export const PageTree: React.FC<PageTreeProps> = ({
  pages,
  currentPageId,
  onPageSelect,
  depth,
  maxDepth = 10,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (pageId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  };

  const handleDelete = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this page?")) {
      try {
        await pagesAPI.delete(pageId);
        // Reload would be handled by parent
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
      onPageSelect(response.page.id);
    } catch (error) {
      console.error("Failed to create child page:", error);
    }
  };

  if (depth >= maxDepth) {
    return null;
  }

  return (
    <div>
      {pages.map((page) => {
        const hasChildren = page.children && page.children.length > 0;
        const isExpanded = expanded.has(page.id);
        const isSelected = currentPageId === page.id;

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
            {hasChildren && isExpanded && (
              <PageTree
                pages={page.children || []}
                currentPageId={currentPageId}
                onPageSelect={onPageSelect}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

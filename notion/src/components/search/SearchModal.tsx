"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, FileText, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchAPI } from "@/lib/api";
import { debounce } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPageSelect: (pageId: string) => void;
}

interface SearchResult {
  type: "page" | "block";
  id: string;
  pageId?: string;
  title?: string;
  content?: string;
  highlight?: string;
  icon?: string;
  emoji?: string;
  blockType?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  open,
  onOpenChange,
  onPageSelect,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const debouncedSearchRef = useRef(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await searchAPI.search(searchQuery);
        setResults(response.results);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300)
  );

  useEffect(() => {
    if (query) {
      setLoading(true);
      debouncedSearchRef.current(query);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].pageId || results[selectedIndex].id);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  const handleSelect = (pageId: string) => {
    onPageSelect(pageId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages and blocks..."
              className="pl-10"
            />
          </div>

          {loading && (
            <div className="mt-4 text-sm text-gray-500 text-center py-8">
              Searching...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center py-8">
              No results found
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="mt-4 max-h-[400px] overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result.pageId || result.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded hover:bg-gray-100
                    flex items-start gap-3
                    ${selectedIndex === index ? "bg-blue-50" : ""}
                  `}
                >
                  {result.type === "page" ? (
                    <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{result.title}</div>
                    {result.type === "block" && (
                      <div className="text-xs text-gray-500 mt-1">
                        {result.blockType} • {result.highlight && (
                          <span className="truncate">{result.highlight}</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="mt-4 text-sm text-gray-500 text-center py-8">
              Start typing to search...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { pagesAPI } from "@/lib/api";
import { Page } from "@/types/notion";

export default function WorkspacePage() {
  const router = useRouter();
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated && currentPageId) {
      loadPage(currentPageId);
    }
  }, [authenticated, currentPageId]);

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Set token in headers for API calls
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("auth_token");
        router.push("/login");
        return;
      }

      setAuthenticated(true);

      // Try to load first page or create one
      try {
        const pagesResponse = await pagesAPI.list();
        if (pagesResponse.pages.length > 0) {
          const firstPage = pagesResponse.pages[0];
          router.push(`/${firstPage.id}`);
        } else {
          // Create initial page
          const newPage = await pagesAPI.create({ title: "Welcome" });
          router.push(`/${newPage.page.id}`);
        }
      } catch (error) {
        console.error("Failed to load pages:", error);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (pageId: string) => {
    try {
      setLoading(true);
      const response = await pagesAPI.get(pageId);
      setCurrentPage(response.page);
    } catch (error) {
      console.error("Failed to load page:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // This page just redirects to the first page or creates one
  // The actual page view is handled by [pageId]/page.tsx
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Redirecting...</div>
    </div>
  );
}

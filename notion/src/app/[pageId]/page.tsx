"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { pagesAPI } from "@/lib/api";
import { Page } from "@/types/notion";

export default function PageView() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.pageId as string;
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated && pageId) {
      loadPage();
    }
  }, [authenticated, pageId]);

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
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
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
      router.push("/login");
    }
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      const response = await pagesAPI.get(pageId);
      setCurrentPage(response.page);
    } catch (error) {
      console.error("Failed to load page:", error);
      router.push("/");
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

  if (!currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Page not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        currentPageId={pageId}
        onPageSelect={(id) => {
          if (id !== pageId) {
            router.push(`/${id}`);
          }
        }}
      />
      <div className="notion-content flex-1 overflow-auto">
        <div className="notion-page-header p-8 pb-4">
          <h1 className="text-4xl font-bold mb-2">{currentPage.title}</h1>
        </div>
        <BlockEditor
          key={pageId}
          pageId={pageId}
          initialBlocks={currentPage.blocks || []}
        />
      </div>
    </div>
  );
}

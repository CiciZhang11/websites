import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.trim();

    // Search pages - SQLite doesn't support case-insensitive mode, so we search normally
    // and filter in memory if needed, or use LIKE for case-insensitive
    const allPages = await prisma.page.findMany({
      where: {
        userId,
        isArchived: false,
      },
      select: {
        id: true,
        title: true,
        icon: true,
        emoji: true,
        updatedAt: true,
      },
    });

    // Filter pages by search term (case-insensitive)
    const pages = allPages
      .filter((page) => page.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 20);

    // Search blocks
    const allBlocks = await prisma.block.findMany({
      where: {
        page: {
          userId,
          isArchived: false,
        },
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Filter blocks by search term in content (case-insensitive)
    const blocks = allBlocks
      .filter((block) => {
        try {
          const content = JSON.parse(block.content || "[]");
          const textContent = Array.isArray(content)
            ? content.map((c: any) => c.text || "").join(" ").toLowerCase()
            : (block.content || "").toLowerCase();
          return textContent.includes(searchTerm.toLowerCase());
        } catch {
          return (block.content || "").toLowerCase().includes(searchTerm.toLowerCase());
        }
      })
      .slice(0, 20);

    const results = [
      ...pages.map((page) => ({
        type: "page" as const,
        id: page.id,
        pageId: page.id,
        title: page.title,
        icon: page.icon,
        emoji: page.emoji,
        updatedAt: page.updatedAt,
      })),
      ...blocks.map((block) => {
        const content = JSON.parse(block.content || "[]");
        const textContent = Array.isArray(content)
          ? content
              .map((c: any) => c.text || "")
              .join(" ")
              .toLowerCase()
          : "";
        const highlight = textContent.includes(searchTerm)
          ? textContent.substring(
              Math.max(0, textContent.indexOf(searchTerm) - 20),
              Math.min(
                textContent.length,
                textContent.indexOf(searchTerm) + searchTerm.length + 20
              )
            )
          : undefined;

        return {
          type: "block" as const,
          id: block.id,
          pageId: block.pageId,
          title: block.page.title,
          content: textContent,
          highlight,
          blockType: block.type,
        };
      }),
    ];

    console.log(`Search for "${query}": found ${pages.length} pages, ${blocks.length} blocks`);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

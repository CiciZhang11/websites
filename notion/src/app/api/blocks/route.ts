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
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json(
        { error: "pageId is required" },
        { status: 400 }
      );
    }

    // Verify page belongs to user
    const userPage = await prisma.page.findFirst({
      where: {
        id: pageId,
        userId,
      },
    });

    if (!userPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Pagination support
    const pageNum = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (pageNum - 1) * limit;

    const blocks = await prisma.block.findMany({
      where: { pageId },
      orderBy: { order: "asc" },
      skip,
      take: limit,
    });

    // Get total count for pagination metadata
    const total = await prisma.block.count({
      where: { pageId },
    });

    return NextResponse.json({ 
      blocks,
      pagination: {
        page: pageNum,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get blocks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pageId, type, content, order, metadata } = await request.json();

    if (!pageId || !type || content === undefined) {
      return NextResponse.json(
        { error: "pageId, type, and content are required" },
        { status: 400 }
      );
    }

    // Verify page belongs to user
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        userId,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // If order not provided, add to end
    let blockOrder = order;
    if (blockOrder === undefined) {
      const maxOrder = await prisma.block.findFirst({
        where: { pageId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      blockOrder = (maxOrder?.order ?? -1) + 1;
    }

    const block = await prisma.block.create({
      data: {
        pageId,
        type,
        content: typeof content === "string" ? content : JSON.stringify(content),
        order: blockOrder,
        metadata: metadata ? (typeof metadata === "string" ? metadata : JSON.stringify(metadata)) : null,
      },
    });

    return NextResponse.json({ block });
  } catch (error) {
    console.error("Create block error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

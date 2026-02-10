import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: "desc" },
      take: 10,
      include: {
        page: {
          select: {
            id: true,
            title: true,
            icon: true,
            emoji: true,
            updatedAt: true,
          },
        },
      },
    });

    const pages = recentlyViewed.map((rv) => rv.page);

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Get recently viewed error:", error);
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

    const { pageId } = await request.json();

    if (!pageId) {
      return NextResponse.json(
        { error: "pageId is required" },
        { status: 400 }
      );
    }

    await prisma.recentlyViewed.upsert({
      where: {
        userId_pageId: {
          userId,
          pageId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId,
        pageId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add recently viewed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

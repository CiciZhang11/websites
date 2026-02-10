import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pagination support
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    const pages = await prisma.page.findMany({
      where: {
        userId,
        isArchived: false,
      },
      orderBy: [
        { parentId: "asc" },
        { order: "asc" },
        { createdAt: "asc" },
      ],
      include: {
        children: {
          where: { isArchived: false },
          orderBy: { order: "asc" },
        },
      },
      skip,
      take: limit,
    });

    // Get total count for pagination metadata
    const total = await prisma.page.count({
      where: {
        userId,
        isArchived: false,
      },
    });

    return NextResponse.json({ 
      pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get pages error:", error);
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

    const { title, parentId, icon, emoji } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Get max order for this parent
    const maxOrder = await prisma.page.findFirst({
      where: {
        userId,
        parentId: parentId || null,
      },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const page = await prisma.page.create({
      data: {
        title,
        parentId: parentId || null,
        icon: icon || null,
        emoji: emoji || null,
        userId,
        order: (maxOrder?.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Create page error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

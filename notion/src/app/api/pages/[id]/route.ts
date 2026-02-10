import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const page = await prisma.page.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        blocks: {
          orderBy: { order: "asc" },
        },
        children: {
          where: { isArchived: false },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Track recently viewed
    await prisma.recentlyViewed.upsert({
      where: {
        userId_pageId: {
          userId,
          pageId: page.id,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId,
        pageId: page.id,
      },
    });

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Get page error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, icon, emoji, parentId } = await request.json();

    const page = await prisma.page.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const updated = await prisma.page.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(icon !== undefined && { icon }),
        ...(emoji !== undefined && { emoji }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
    });

    return NextResponse.json({ page: updated });
  } catch (error) {
    console.error("Update page error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const page = await prisma.page.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Soft delete (archive)
    await prisma.page.update({
      where: { id: params.id },
      data: { isArchived: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete page error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

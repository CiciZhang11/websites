import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { updates } = await request.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Updates must be an array" },
        { status: 400 }
      );
    }

    // Verify all blocks belong to user's pages
    const blockIds = updates.map((u: { id: string }) => u.id);
    const blocks = await prisma.block.findMany({
      where: { id: { in: blockIds } },
      include: { page: true },
    });

    const invalidBlocks = blocks.filter((b) => b.page.userId !== userId);
    if (invalidBlocks.length > 0) {
      return NextResponse.json(
        { error: "Some blocks not found or unauthorized" },
        { status: 403 }
      );
    }

    // Update all blocks in a transaction
    await prisma.$transaction(
      updates.map((update: { id: string; order: number }) =>
        prisma.block.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder blocks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

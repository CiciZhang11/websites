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

    // Update all pages in a transaction
    await prisma.$transaction(
      updates.map((update: { id: string; order: number; parentId?: string }) =>
        prisma.page.update({
          where: { id: update.id },
          data: {
            order: update.order,
            ...(update.parentId !== undefined && {
              parentId: update.parentId || null,
            }),
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder pages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

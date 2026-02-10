import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, content, order, metadata } = await request.json();

    // Verify block belongs to user's page
    const block = await prisma.block.findUnique({
      where: { id: params.id },
      include: {
        page: true,
      },
    });

    if (!block || block.page.userId !== userId) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    const updated = await prisma.block.update({
      where: { id: params.id },
      data: {
        ...(type !== undefined && { type }),
        ...(content !== undefined && {
          content: typeof content === "string" ? content : JSON.stringify(content),
        }),
        ...(order !== undefined && { order }),
        ...(metadata !== undefined && {
          metadata: metadata
            ? typeof metadata === "string"
              ? metadata
              : JSON.stringify(metadata)
            : null,
        }),
      },
    });

    return NextResponse.json({ block: updated });
  } catch (error) {
    console.error("Update block error:", error);
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

    // Verify block belongs to user's page
    const block = await prisma.block.findUnique({
      where: { id: params.id },
      include: {
        page: true,
      },
    });

    if (!block || block.page.userId !== userId) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    await prisma.block.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete block error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

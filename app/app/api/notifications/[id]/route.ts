import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
      deletedId: id,
    });

  } catch (error) {
    console.error("DELETE notification failed:", error);

    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";

function computeDaysLeft(dueDate: Date) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const daysLeft = Math.round((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const dueStatus = daysLeft < 0 ? "OVERDUE" : daysLeft === 0 ? "DUE_TODAY" : "DUE_IN_X_DAYS";
  return { daysLeft, dueStatus };
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await ctx.params;

    const body = await req.json();
    const data: any = {};

    if (body?.title !== undefined) data.title = (body.title as string).trim();
    if (body?.notes !== undefined) data.notes = ((body.notes as string) ?? "").trim() || null;

    if (body?.priority !== undefined) data.priority = body.priority;

    if (body?.dueDate !== undefined) {
      const d = new Date(body.dueDate as string);
      if (Number.isNaN(d.getTime())) return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
      data.dueDate = d;
    }

    if (body?.status !== undefined) {
      const status = body.status as string;
      if (status !== "PENDING" && status !== "DONE") {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = status;
      data.completedAt = status === "DONE" ? new Date() : null;
    }

    if (body?.courseId !== undefined) {
      const courseId = body.courseId as string | null;
      if (courseId) {
        const owned = await prisma.course.findFirst({
          where: { id: courseId, semester: { userId } },
          select: { id: true },
        });
        if (!owned) return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
      }
      data.courseId = courseId;
    }

    const updated = await prisma.assignment.updateMany({
      where: { id, userId },
      data,
    });

    if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const fresh = await prisma.assignment.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        priority: true,
        notes: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        courseId: true,
        course: { select: { id: true, name: true, code: true, credit: true } },
      },
    });

    return NextResponse.json({ ok: true, data: { ...fresh!, ...computeDaysLeft(fresh!.dueDate) } });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await ctx.params;

    const deleted = await prisma.assignment.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}

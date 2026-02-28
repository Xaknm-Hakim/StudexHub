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

// GET /api/assignments?status=PENDING|DONE&courseId=...&q=...&sort=dueDate&order=asc
export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const url = new URL(req.url);

    const status = url.searchParams.get("status"); // PENDING|DONE
    const courseId = url.searchParams.get("courseId");
    const q = url.searchParams.get("q")?.trim();
    const sort = url.searchParams.get("sort") ?? "dueDate";
    const order = (url.searchParams.get("order") ?? "asc").toLowerCase() === "desc" ? "desc" : "asc";

    const where: any = { userId };
    if (status) where.status = status;
    if (courseId) where.courseId = courseId;
    if (q) where.title = { contains: q, mode: "insensitive" };

    const rows = await prisma.assignment.findMany({
      where,
      orderBy: { [sort]: order },
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

    const data = rows.map((a) => ({ ...a, ...computeDaysLeft(a.dueDate) }));
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();

    const title = (body?.title as string | undefined)?.trim();
    const dueDateRaw = body?.dueDate as string | undefined;
    const notes = (body?.notes as string | undefined)?.trim() || null;
    const priority = (body?.priority as string | undefined) ?? "MEDIUM";
    const courseId = (body?.courseId as string | undefined) ?? null;

    if (!title || !dueDateRaw) {
      return NextResponse.json({ error: "title and dueDate are required" }, { status: 400 });
    }

    const dueDate = new Date(dueDateRaw);
    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
    }

    // courseId ownership check (Course belongs to user via Semester)
    if (courseId) {
      const owned = await prisma.course.findFirst({
        where: { id: courseId, semester: { userId } },
        select: { id: true },
      });
      if (!owned) return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    const created = await prisma.assignment.create({
      data: {
        userId,
        title,
        dueDate,
        notes,
        priority,
        status: "PENDING",
        courseId,
      },
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

    return NextResponse.json({ ok: true, data: { ...created, ...computeDaysLeft(created.dueDate) } }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}

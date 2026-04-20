import { NextRequest, NextResponse } from "next/server";
import { AssignmentPriority, AssignmentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { ApiResponse, AssignmentWithMeta } from "@/src/lib/types/api";
import type { CreateAssignmentBody } from "@/src/lib/types/requests";
import { getErrorMessage } from "@/src/lib/types/common";

function computeDaysLeft(dueDate: Date) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const daysLeft = Math.round(
    (due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dueStatus =
    daysLeft < 0 ? "OVERDUE" : daysLeft === 0 ? "DUE_TODAY" : "DUE_IN_X_DAYS";

  return { daysLeft, dueStatus };
}

function isAssignmentPriority(value: unknown): value is AssignmentPriority {
  return (
    typeof value === "string" &&
    Object.values(AssignmentPriority).includes(value as AssignmentPriority)
  );
}

function isAssignmentStatus(value: unknown): value is AssignmentStatus {
  return (
    typeof value === "string" &&
    Object.values(AssignmentStatus).includes(value as AssignmentStatus)
  );
}

function toAssignmentWithMetaResponse(assignment: {
  id: string;
  userId: string;
  title: string;
  dueDate: Date;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  notes: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  courseId: string | null;
  course: {
    id: string;
    name: string;
    code: string | null;
    credit: number;
  } | null;
}): AssignmentWithMeta {
  const { daysLeft, dueStatus } = computeDaysLeft(assignment.dueDate);

  return {
    id: assignment.id,
    userId: assignment.userId,
    courseId: assignment.courseId,
    title: assignment.title,
    dueDate: assignment.dueDate.toISOString(),
    status: assignment.status,
    priority: assignment.priority,
    notes: assignment.notes,
    completedAt: assignment.completedAt?.toISOString() ?? null,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
    daysLeft,
    dueStatus,
    course: assignment.course
      ? {
          id: assignment.course.id,
          name: assignment.course.name,
          code: assignment.course.code,
          credit: assignment.course.credit,
        }
      : null,
  };
}

// GET /api/assignments?status=PENDING|DONE&courseId=...&q=...&sort=dueDate&order=asc
export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const url = new URL(req.url);

    const statusParam = url.searchParams.get("status");
    const courseId = url.searchParams.get("courseId");
    const q = url.searchParams.get("q")?.trim();
    const sortParam = url.searchParams.get("sort") ?? "dueDate";
    const order: Prisma.SortOrder =
      (url.searchParams.get("order") ?? "asc").toLowerCase() === "desc"
        ? "desc"
        : "asc";

    const where: Prisma.AssignmentWhereInput = { userId };

    if (statusParam) {
      if (!isAssignmentStatus(statusParam)) {
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
            error: "Invalid status",
          },
          { status: 400 }
        );
      }

      where.status = statusParam;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (q) {
      where.title = { contains: q, mode: "insensitive" };
    }

    const allowedSortFields: Record<string, true> = {
      dueDate: true,
      createdAt: true,
      updatedAt: true,
      title: true,
      priority: true,
      status: true,
    };

    const sortField = allowedSortFields[sortParam] ? sortParam : "dueDate";

    const rows = await prisma.assignment.findMany({
      where,
      orderBy: { [sortField]: order },
      select: {
        id: true,
        userId: true,
        title: true,
        dueDate: true,
        status: true,
        priority: true,
        notes: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        courseId: true,
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            credit: true,
          },
        },
      },
    });

    const data: AssignmentWithMeta[] = rows.map((assignment) =>
      toAssignmentWithMetaResponse(assignment)
    );

    return NextResponse.json<ApiResponse<AssignmentWithMeta[]>>(
      {
        ok: true,
        data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error(error);

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Failed to fetch assignments",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body: CreateAssignmentBody = await req.json();

    const title = body.title?.trim();
    const dueDateRaw = body.dueDate;
    const notes = body.notes?.trim() || null;
    const courseId = body.courseId ?? null;

    const rawPriority = body.priority;
    const priority: AssignmentPriority =
      rawPriority == null
        ? AssignmentPriority.MEDIUM
        : isAssignmentPriority(rawPriority)
          ? rawPriority
          : AssignmentPriority.MEDIUM;

    if (!title || !dueDateRaw) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "title and dueDate are required",
        },
        { status: 400 }
      );
    }

    const dueDate = new Date(dueDateRaw);

    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Invalid dueDate",
        },
        { status: 400 }
      );
    }

    if (courseId) {
      const owned = await prisma.course.findFirst({
        where: {
          id: courseId,
          semester: { userId },
        },
        select: { id: true },
      });

      if (!owned) {
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
            error: "Invalid courseId",
          },
          { status: 400 }
        );
      }
    }

    const created = await prisma.assignment.create({
      data: {
        userId,
        title,
        dueDate,
        notes,
        priority,
        status: AssignmentStatus.PENDING,
        courseId,
      },
      select: {
        id: true,
        userId: true,
        title: true,
        dueDate: true,
        status: true,
        priority: true,
        notes: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        courseId: true,
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            credit: true,
          },
        },
      },
    });

    const data: AssignmentWithMeta = toAssignmentWithMetaResponse(created);

    return NextResponse.json<ApiResponse<AssignmentWithMeta>>(
      {
        ok: true,
        data,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error(error);

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Failed to create assignment",
      },
      { status: 500 }
    );
  }
}

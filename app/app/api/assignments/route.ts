import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { AssignmentPriority, AssignmentStatus } from "@/src/lib/types/enums";
import type { AssignmentRecord, CourseRecord } from "@/src/lib/types/db";
import type { CreateAssignmentBody } from "@/src/lib/types/requests";
import { getErrorMessage } from "@/src/lib/types/common";

const assignmentPriorities = ["LOW", "MEDIUM", "HIGH"] as const satisfies readonly AssignmentPriority[];
const assignmentStatuses = ["PENDING", "DONE"] as const satisfies readonly AssignmentStatus[];

function computeDaysLeft(dueDate: Date) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const daysLeft = Math.round((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const dueStatus =
    daysLeft < 0 ? "OVERDUE" : daysLeft === 0 ? "DUE_TODAY" : "DUE_IN_X_DAYS";

  return { daysLeft, dueStatus };
}

function isAssignmentPriority(value: unknown): value is AssignmentPriority {
  return (
    typeof value === "string" &&
    assignmentPriorities.includes(value as AssignmentPriority)
  );
}

function isAssignmentStatus(value: unknown): value is AssignmentStatus {
  return (
    typeof value === "string" &&
    assignmentStatuses.includes(value as AssignmentStatus)
  );
}

type SortOrder = "asc" | "desc";

type AssignmentListRow = Pick<
  AssignmentRecord,
  | "id"
  | "title"
  | "dueDate"
  | "status"
  | "priority"
  | "notes"
  | "completedAt"
  | "createdAt"
  | "updatedAt"
  | "courseId"
> & {
  course: Pick<CourseRecord, "id" | "name" | "code" | "credit"> | null;
};

// GET /api/assignments?status=PENDING|DONE&courseId=...&q=...&sort=dueDate&order=asc
export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const url = new URL(req.url);

    const statusParam = url.searchParams.get("status");
    const courseId = url.searchParams.get("courseId");
    const q = url.searchParams.get("q")?.trim();
    const sortParam = url.searchParams.get("sort") ?? "dueDate";
    const order: SortOrder =
      (url.searchParams.get("order") ?? "asc").toLowerCase() === "desc" ? "desc" : "asc";

    const where: {
      userId: string;
      status?: AssignmentStatus;
      courseId?: string;
      title?: { contains: string; mode: "insensitive" };
    } = { userId };

    if (statusParam) {
      if (!isAssignmentStatus(statusParam)) {
        return NextResponse.json(
          {
            success: false,
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

    const rows: AssignmentListRow[] = await prisma.assignment.findMany({
      where,
      orderBy: { [sortField]: order },
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

    const data = rows.map((assignment) => ({
      ...assignment,
      ...computeDaysLeft(assignment.dueDate),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch assignments",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = (await req.json()) as CreateAssignmentBody;

    const title = body.title?.trim();
    const dueDateRaw = body.dueDate;
    const notes = body.notes?.trim() || null;
    const courseId = body.courseId ?? null;

    const rawPriority = body.priority;
    const priority: AssignmentPriority =
      rawPriority == null
        ? "MEDIUM"
        : isAssignmentPriority(rawPriority)
          ? rawPriority
          : "MEDIUM";

    if (!title || !dueDateRaw) {
      return NextResponse.json(
        {
          success: false,
          error: "title and dueDate are required",
        },
        { status: 400 }
      );
    }

    const dueDate = new Date(dueDateRaw);

    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
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
        return NextResponse.json(
          {
            success: false,
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

    return NextResponse.json(
      {
        success: true,
        data: {
          ...created,
          ...computeDaysLeft(created.dueDate),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create assignment",
      },
      { status: 500 }
    );
  }
}

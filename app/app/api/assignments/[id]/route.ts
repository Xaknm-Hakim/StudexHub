import { NextRequest, NextResponse } from "next/server";
import { AssignmentPriority, AssignmentStatus } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { ApiResponse, AssignmentWithMeta } from "@/src/lib/types/api";
import type { UpdateAssignmentBody } from "@/src/lib/types/requests";
import { getErrorMessage } from "@/src/lib/types/common";

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

type RouteContext = {
  params: Promise<{ id: string }>;
};

type DeleteAssignmentResult = {
  id: string;
};

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await ctx.params;

    const body: UpdateAssignmentBody = await req.json();

    const data: {
      title?: string;
      notes?: string | null;
      priority?: AssignmentPriority;
      dueDate?: Date;
      status?: AssignmentStatus;
      completedAt?: Date | null;
      courseId?: string | null;
    } = {};

    if (body.title !== undefined) {
      const title = body.title.trim();

      if (!title) {
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
            error: "title cannot be empty",
          },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if (body.notes !== undefined) {
      data.notes = body.notes?.trim() || null;
    }

    if (body.priority !== undefined) {
      if (!isAssignmentPriority(body.priority)) {
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
            error: "Invalid priority",
          },
          { status: 400 }
        );
      }

      data.priority = body.priority;
    }

    if (body.dueDate !== undefined) {
      const dueDate = new Date(body.dueDate);

      if (Number.isNaN(dueDate.getTime())) {
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
            error: "Invalid dueDate",
          },
          { status: 400 }
        );
      }

      data.dueDate = dueDate;
    }

    if (body.status !== undefined) {
      if (!isAssignmentStatus(body.status)) {
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
            error: "Invalid status",
          },
          { status: 400 }
        );
      }

      data.status = body.status;
      data.completedAt = body.status === AssignmentStatus.DONE ? new Date() : null;
    }

    if (body.completedAt !== undefined && body.status === undefined) {
      const completedAt = body.completedAt ? new Date(body.completedAt) : null;

      if (completedAt && Number.isNaN(completedAt.getTime())) {
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
            error: "Invalid completedAt",
          },
          { status: 400 }
        );
      }

      data.completedAt = completedAt;
    }

    if (body.courseId !== undefined) {
      const courseId = body.courseId;

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

      data.courseId = courseId;
    }

    const updated = await prisma.assignment.updateMany({
      where: { id, userId },
      data,
    });

    if (updated.count === 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Not found",
        },
        { status: 404 }
      );
    }

    const fresh = await prisma.assignment.findFirst({
      where: { id, userId },
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

    if (!fresh) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<AssignmentWithMeta>>(
      {
        ok: true,
        data: toAssignmentWithMetaResponse(fresh),
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
        error: "Failed to update assignment",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await ctx.params;

    const deleted = await prisma.assignment.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<DeleteAssignmentResult>>(
      {
        ok: true,
        data: { id },
        message: "Assignment deleted successfully",
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
        error: "Failed to delete assignment",
      },
      { status: 500 }
    );
  }
}

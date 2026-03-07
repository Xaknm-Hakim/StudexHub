import { NextResponse } from "next/server";
import { requireUserId } from "@/src/lib/auth";
import { SEMESTER_OPTIONS } from "@/src/lib/semester";

export async function GET() {
  await requireUserId();

  return NextResponse.json({
    semesters: SEMESTER_OPTIONS,
  });
}

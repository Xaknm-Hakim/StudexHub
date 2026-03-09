"use client";

import { useRouter } from "next/navigation";

type SemesterStat = {
  semesterId: string;
  name: string;
  year: number | null;
  gpa: number | null;
  credits: number;
};

type Summary = {
  cgpa: number | null;
  totalCredits: number;
  semesterStats: SemesterStat[];
};

export default async function DashboardPage() {
  const router = useRouter();
  const res = await fetch("/api/academics/summary", { cache: "no-store"});
  const summary = await res.json();


  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl space-y-4">
        <h1 className="text-2xl text-center font-bold">Dashboard and Home!</h1>
        <p className="text-center text-gray-400">how are you doing?</p>

        {/* CGPA Summary */}
        <div className="bg-zinc-800 p-4 rounded-xl text-center space-y-2">
          <p className="text-sm text-zinc-400">Overall CGPA</p>
          <p className="text-3xl font-bold">{summary?.cgpa?.toFixed(2) ?? "N/A"}</p>
          <p className="text-sm text-zinc-400">
            Total Credits: {summary?.totalCredits ?? 0}
          </p>
        </div>

        {/* Semester GPA list */}
        <div className="bg-zinc-800 p-4 rounded-xl space-y-1">
          <p className="font-semibold text-center mb-2">Semester GPA</p>
          {summary?.semesterStats.length ? (
            summary.semesterStats.map((s: SemesterStat) => (
              <div key={s.semesterId} className="flex justify-between text-sm">
                <span>
                  {s.name} {s.year ? `(${s.year})` : ""}
                </span>
                <span>{s.gpa !== null ? s.gpa.toFixed(2) : "N/A"}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-zinc-400">No semesters yet.</p>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="w-full flex flex-col items-center gap-4 mt-4">
          <button
            onClick={() => router.push("/assignments")}
            className="px-4 py-2 bg-black font-semibold text-white border-2 border-white rounded-full cursor-pointer hover:bg-white hover:text-black transition duration-300 ease-in-out"
          >
            go to assignments
          </button>

          <button
            onClick={() => router.push("/cgpa")}
            className="px-4 py-2 bg-black font-semibold text-white border-2 border-white rounded-full cursor-pointer hover:bg-white hover:text-black transition duration-300 ease-in-out"
          >
            go to CGPA
          </button>

          <button
            onClick={() => router.push("/schedules")}
            className="px-4 py-2 bg-black font-semibold text-white border-2 border-white rounded-full cursor-pointer hover:bg-white hover:text-black transition duration-300 ease-in-out"
          >
            go to schedule
          </button>

          <button
            onClick={() => router.push("/about")}
            className="px-4 py-2 text-white font-medium hover:underline"
          >
            about us
          </button>
        </div>
      </div>
    </main>
  );
}
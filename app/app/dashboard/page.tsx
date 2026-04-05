"use client";

import { useState, useEffect } from "react";
import { Summary, SemesterStat } from "@/src/lib/types/summary";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";


export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        //Fetcing summary
        const res = await fetch("/api/academics/summary", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch summary");

        const data: Summary = await res.json();
        setSummary(data);

        //fetching user name
        const userRes = await fetch("api/auth/me");
        if (!userRes.ok) throw new Error("failed to fetch user");

        const userData = await userRes.json();
        setName(userData.user.name);

      } catch (err) {
        console.error(err);
        
      }
    }

    fetchData();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl space-y-4 relative">

        <div className="absolute top-4 right-4">
          <NotificationBell />
        </div>
        <h1 className="text-3xl text-center font-bold tracking-tight">{"What's good" + (name ? `, ${name}` : "") + "?"}</h1>
        <p className="text-center text-zinc-400 text-sm">wanna do something?</p>

      {/* this is the summary cards*/}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-800 p-4 rounded-xl text-center">
            <p className="text-sm text-zinc-400">CGPA</p>
            <p className="text-3xl font-bold">{summary?.cgpa?.toFixed(2) ?? "N/A"}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-xl text-center">
            <p className="text-sm text-zinc-400">Total Credits</p>
            <p className="text-3xl font-bold">{summary?.totalCredits ?? 0}</p>
          </div>
        </div>
      {/*up until here*/}
      {/*below is the semester GPA */}
        <div className="bg-zinc-800 p-4 rounded-xl space-y-2">
          <p className="font-semibold text-center mb-2 text-lg">Semester GPA</p>

          {summary?.semesterStats?.length ? (
            summary.semesterStats.map((s) => (
              <div
                key={s.semesterId}
                className="flex justify-between bg-zinc-900 px-3 py-2 rounded-lg"
              >
                <span>
                  {s.name} {s.year ? `(${s.year})` : ""}
                </span>

                <span className="font-semibold text-green-400">
                  {s.gpa !== null ? s.gpa.toFixed(2) : "N/A"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-zinc-400">No semesters yet.</p>
          )}
        </div>

      {/*up until here for semester GPA */}

      {/*below are navigation buttons */}
        <div className=" grid grid-cols-2 gap-3 mt-4">
          <button onClick={() => router.push("/assignments")} className="px-4 py-2 bg-black font-semibold text-white border-2 border-white rounded-full hover:bg-white hover:text-black">
          Assignments
          </button>

          <button onClick={() => router.push("/cgpa")} className="px-4 py-2 bg-black font-semibold text-white border-2 border-white rounded-full hover:bg-white hover:text-black">
          CGPA
          </button>

          <button onClick={() => router.push("/schedules")} className="px-4 py-2 bg-black font-semibold text-white border-2 border-white rounded-full hover:bg-white hover:text-black">
          Schedules
          </button>

          <button onClick={() => router.push("/about")} className="px-4 py-2 bg-black font-semibold text-white border-2 border-white rounded-full hover:bg-white hover:text-black">
          About Us
          </button>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import ScheduleForm from "@/components/ScheduleForm";
import ScheduleTable from "@/components/ScheduleTable";
import { useRouter } from "next/navigation";

type ClassSchedule = {
  id: string;
  title: string;
  dayOfWeek: number;
  day: string;
  startTime: string;
  endTime: string;
  location: string | null;
};

export default function SchedulePage() {

  const router = useRouter();
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null);

  async function fetchSchedules() {
    const res = await fetch("/api/class-schedules");
    const data = await res.json();
    setSchedules(data);
  }
    async function handleDelete(id: string) {
    await fetch(`/api/class-schedules/${id}`, {
      method: "DELETE",
    });
    
    fetchSchedules();
  }

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <main className="p-6 text-white">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-1 bg-black font-monospace text-white border-1 border-white rounded-lg cursor-pointer hover:bg-white hover:text-black transition duration-300 ease-in-out ">
          Main Page
        </button>
      <h1 className="text-2xl font-bold mb-6">Class Schedule</h1>

      <ScheduleForm 
      onSuccess={fetchSchedules}
      editingSchedule={editingSchedule}
      clearEdit={() => setEditingSchedule(null)}
       />

      <ScheduleTable 
      schedules={schedules}
      onDelete={handleDelete}
      onEdit={setEditingSchedule}
      />
    </main>
  );
}
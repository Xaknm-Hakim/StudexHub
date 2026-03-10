"use client";

import { useEffect, useState } from "react";
import ScheduleForm from "@/components/ScheduleForm";
import ScheduleTable from "@/components/ScheduleTable";

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

  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);

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
      <h1 className="text-2xl font-bold mb-6">Class Schedule</h1>
      <ScheduleForm onSuccess={fetchSchedules} />
      <ScheduleTable 
      schedules={schedules}
      onDelete={handleDelete}
      />
    </main>
  );
}
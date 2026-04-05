"use client";

import { useEffect, useState } from "react";

type ClassSchedule = {
  id: string
  title: string
  dayOfWeek: number
  startTime: string
  endTime: string
  location: string | null
}

type Props = {
  onSuccess: () => void;
  editingSchedule: ClassSchedule | null;
  clearEdit: () => void;
};

export default function ScheduleForm({ onSuccess, editingSchedule, clearEdit }: Props) {
  
  const [title, setTitle] = useState(() => editingSchedule?.title ?? "");
  const [dayOfWeek, setDayOfWeek] = useState (
    () => editingSchedule?.dayOfWeek ?? 1
  );
  const [startTime, setStartTime] = useState(
    () => editingSchedule?.startTime ?? ""
  );
  const [endTime, setEndTime] = useState(
    () => editingSchedule?.endTime ?? ""
  );
  const [location, setLocation] = useState(
    () => editingSchedule?.location ?? ""
  );

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  if (editingSchedule) {
    await fetch(`/api/class-schedules/${editingSchedule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        dayOfWeek,
        startTime,
        endTime,
        location,
      }),
    })

    clearEdit()
  } else {
    await fetch("/api/class-schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        dayOfWeek,
        startTime,
        endTime,
        location,
      }),
    })
  }

  setTitle("");
  setDayOfWeek(1);
  setStartTime("");
  setEndTime("");
  setLocation("");

  onSuccess()
}

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-2">
      <input
        className="p-2 rounded bg-zinc-800 w-full"
        placeholder="Class Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <select
        className="p-2 rounded bg-zinc-800 w-full"
        value={dayOfWeek}
        onChange={(e) => setDayOfWeek(Number(e.target.value))}
      >
        <option value={1}>Monday</option>
        <option value={2}>Tuesday</option>
        <option value={3}>Wednesday</option>
        <option value={4}>Thursday</option>
        <option value={5}>Friday</option>
      </select>
      <input
        type="time"
        className="p-2 rounded bg-zinc-800 w-full"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        required
      />
      <input
        type="time"
        className="p-2 rounded bg-zinc-800 w-full"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        required
      />
      <input
        className="p-2 rounded bg-zinc-800 w-full"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button className="w-full py-2 bg-white text-black rounded font-semibold">
        {editingSchedule ? "Update Class" : "Add Class"}
      </button>
    </form>
  );
}
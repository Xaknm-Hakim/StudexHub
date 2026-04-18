"use client";

import { useState } from "react";

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
  
  const [form, setForm] = useState({
    title: "",
    dayOfWeek: 1,
    startTime: "",
    endTime: "",
    location: "",
  });

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  if (editingSchedule) {
    await fetch(`/api/class-schedules/${editingSchedule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    clearEdit()
  } else {
    await fetch("/api/class-schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
  }

  setForm({
    title: "",
    dayOfWeek: 1,
    startTime: "",
    endTime: "",
    location: "",
  });

  onSuccess()
}

  return (
      <form
      key={editingSchedule?.id ?? "new"}
      onSubmit={handleSubmit}
      className="mb-6 space-y-2"
      >
      <input
        className="p-2 rounded bg-zinc-800 w-full"
        placeholder="Class Name"
        value={form.title}
        onChange={(e) => 
          setForm(prev => ({ ...prev, title: e.target.value}))
        }
      />
      <select
        className="p-2 rounded bg-zinc-800 w-full"
        value={form.dayOfWeek}
        onChange={(e) => 
          setForm(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))
      }
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
        value={form.startTime}
        onChange={(e) =>
          setForm(prev => ({...prev, startTime: e.target.value }))
        }
      />
      <input
        type="time"
        className="p-2 rounded bg-zinc-800 w-full"
        value={form.endTime}
        onChange={(e) => 
          setForm(prev => ({...prev, endTime: e.target.value}))
        }
      />
      <input
        className="p-2 rounded bg-zinc-800 w-full"
        placeholder="Location"
        value={form.location}
        onChange={(e) =>
          setForm(prev => ({ ...prev, location: e.target.value }))
        }
      />
      <button className="w-full py-2 bg-white text-black rounded font-semibold">
        {editingSchedule ? "Update Class" : "Add Class"}
      </button>
    </form>
  );
}
"use client";

import { useState } from "react";

type Props = {
  onSuccess: () => void;
};

export default function ScheduleForm({ onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    try {
      const res = await fetch("/api/class-schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          dayOfWeek,
          startTime,
          endTime,
          location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // reset form
      setTitle("");
      setDayOfWeek(1);
      setStartTime("");
      setEndTime("");
      setLocation("");

      // refresh schedule list
      onSuccess();
    } catch (err) {
      setError("Failed to create schedule.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 p-6 rounded-xl mb-6 space-y-4"
    >
      <h2 className="text-xl font-bold">Add Class Schedule</h2>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Class Name */}
      <input
        type="text"
        placeholder="Class Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 rounded bg-zinc-800"
        required
      />

      {/* Day Dropdown */}
      <select
        value={dayOfWeek}
        onChange={(e) => setDayOfWeek(Number(e.target.value))}
        className="w-full p-2 rounded bg-zinc-800"
      >
        <option value={1}>Monday</option>
        <option value={2}>Tuesday</option>
        <option value={3}>Wednesday</option>
        <option value={4}>Thursday</option>
        <option value={5}>Friday</option>
      </select>

      {/* Start Time */}
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="w-full p-2 rounded bg-zinc-800"
        required
      />

      {/* End Time */}
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="w-full p-2 rounded bg-zinc-800"
        required
      />

      {/* Location */}
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full p-2 rounded bg-zinc-800"
      />

      <button
        type="submit"
        className="w-full bg-white text-black py-2 rounded font-semibold hover:bg-gray-200"
      >
        Add Class
      </button>
    </form>
  );
}
"use client";

import { useEffect, useState } from "react";

export default function AssignmentForm({
  onAdd,
  editing,
}: {
  onAdd: (assignment: {
    title: string;
    courseId: string | null;
    dueDate: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    notes?: string | null;

  }) => void;
  editing: any;
}) {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setCourseId(editing.course?.id ?? "");
      setDueDate(editing.dueDate.split("T")[0]);
      setPriority(editing.priority);
      setNotes(editing.notes ?? "");
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ 
      title, 
      dueDate: new Date(dueDate).toISOString(), 
      priority,
      notes : notes || null,
      courseId : courseId || null,
    });

    setTitle("");
    setPriority("MEDIUM");
    setDueDate("");
    setNotes("");

  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow rounded-xl p-6 space-y-4 text-black"
    >
      <h2 className="text-lg font-semibold">
        {editing ? "Edit Assignment" : "Add Assignment"}
      </h2>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Assignment Title"
        className="w-full border rounded p-2 text-black"
      />

      <input
        type="text"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        placeholder="Course"
        className="w-full border rounded p-2 text-black"
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full border rounded p-2 text-black"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {editing ? "Update" : "Add"}
      </button>
    </form>
  );
}
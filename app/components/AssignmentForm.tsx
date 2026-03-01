"use client";

import { useEffect, useState } from "react";

export default function AssignmentForm({
  onAdd,
  editing,
}: {
  onAdd: (assignment: {
    title: string;
    courseId: string;
    dueDate: string;
  }) => void;
  editing: any;
}) {
  const [title, setTitle] = useState("");
  const [courseId, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setCourse(editing.course);
      setDueDate(editing.dueDate.split("T")[0]);
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, courseId, dueDate });
    setTitle("");
    setCourse("");
    setDueDate("");
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
        onChange={(e) => setCourse(e.target.value)}
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
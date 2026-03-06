"use client";

import { useEffect, useState } from "react";

export default function AssignmentForm({
  onAdd,
  editing,
  onCancel,
}: {
  onAdd: (assignment: {
    title: string;
    dueDate: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    notes?: string | null;
  }) => void;
  editing: any;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] =
    useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title ?? "");
      setDueDate((editing.dueDate ?? "").split("T")[0]);
      setPriority(editing.priority ?? "MEDIUM");
      setNotes(editing.notes ?? "");
    } else {
      // Reset form when leaving edit mode
      setTitle("");
      setDueDate("");
      setPriority("MEDIUM");
      setNotes("");
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !dueDate) {
      console.error("Title and Due Date are required");
      return;
    }

    onAdd({
      title,
      dueDate: new Date(dueDate).toISOString(),
      priority,
      notes,
    });
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
        className="w-full border rounded p-2"
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full border rounded p-2"
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="w-full border rounded p-2"
      />

      <div className="space-x-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editing ? "Update" : "Add"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
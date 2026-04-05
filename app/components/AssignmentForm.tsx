"use client";

import {AssignmentFormData, Priority } from "@/src/lib/types";
import { useState } from "react";

type Props = {
  onAdd: (assignment: AssignmentFormData) => void;
  editing: AssignmentFormData | null;
  onCancel: () => void;
};

export default function AssignmentForm({
  onAdd,
  editing,
  onCancel,
}: Props)

{
const [title, setTitle] = useState(() => editing?.title ?? "");
const [dueDate, setDueDate] = useState(() =>
  editing?.dueDate?.split("T")[0] ?? ""
);
const [priority, setPriority] = useState<Priority>(
  editing?.priority ?? "MEDIUM"
);
const [notes, setNotes] = useState(() => editing?.notes ?? "");

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
      className="bg-zinc-800 p-6 rounded-xl space-y-4 text-white w-full max-w-md mx-auto"
    >
      <h2 className="text-lg font-semibold">
        {editing ? "Edit Assignment" : "Add Assignment"}
      </h2>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Assignment Title"
        className="w-full bg-zinc-900 rounded-lg p-2"
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full bg-zinc-900 rounded-lg p-2"
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="w-full bg-zinc-900 rounded-lg p-2"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={priority}
          onChange={(e) =>
           setPriority(e.target.value as Priority)
          }
          className="p-2 rounded-lg bg-zinc-900"
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
          
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          {editing ? "Update" : "Add"}
        </button>
      </div>
        
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 bg-zinc-600 rounded-lg hover:bg-zinc-700 transition"
          >
            Cancel
          </button>
        )}
      
    </form>
  );
}
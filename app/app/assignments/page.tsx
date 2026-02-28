"use client";

import { useState } from "react";
import AssignmentTable from "@/components/AssignmentTable";
import AssignmentForm from "@/components/AssignmentForm";

type Assignment = {
  id: number;
  title: string;
  course: string;
  dueDate: string;
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editing, setEditing] = useState<Assignment | null>(null);

  const addAssignment = (data: Omit<Assignment, "id">) => {
    if (editing) {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === editing.id ? { ...a, ...data } : a
        )
      );
      setEditing(null);
    } else {
      const newAssignment: Assignment = {
        id: Date.now(),
        ...data,
      };
      setAssignments((prev) => [...prev, newAssignment]);
    }
  };

  const deleteAssignment = (id: number) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const editAssignment = (assignment: Assignment) => {
    setEditing(assignment);
  };

  return (
    <div className="p-6 space-y-8">
      <AssignmentForm
        onAdd={addAssignment}
        editing={editing}
      />

      <AssignmentTable
        assignments={assignments}
        onDelete={deleteAssignment}
        onEdit={editAssignment}
      />
    </div>
  );
}
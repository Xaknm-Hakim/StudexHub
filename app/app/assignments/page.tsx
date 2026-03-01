"use client";

import { useEffect, useState } from "react";
import AssignmentTable from "@/components/AssignmentTable";
import AssignmentForm from "@/components/AssignmentForm";

type Assignment = {
  id: string;
  title: string;
  dueDate: string;
  status: "PENDING" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  notes: string | null;
  daysLeft: number;
  dueStatus: "OVERDUE" | "DUE_TODAY" | "DUE_IN_X_DAYS";
  course: {
    id: string;
    name: string;
    code: string | null;
    credit: number;
    
  } | null
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editing, setEditing] = useState<Assignment | null>(null);

  const fetchAssignments = async () => {
  const res = await fetch("/api/assignments?sort=dueDate&order=asc");

  if (!res.ok) {
    console.error("Failed to fetch assignments");
    return;
  }

  const json = await res.json();
  setAssignments(json.data);
};

useEffect(() => {
  fetchAssignments();
}, []);

const addOrUpdateAssignment = async (data: any) => {
  if (editing) {
    // UPDATE (PATCH)
    await fetch(`/api/assignments/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        dueData: new Date(data.dueData).toISOString(),
      }),
    });

    setEditing(null);
  } else {
    // CREATE (POST)
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
      }),
    });
  }

  fetchAssignments();
};

  const deleteAssignment = async (id: string) => {
    await fetch(`/api/assignments/${id}`, {
      method: "DELETE",
    });

    fetchAssignments();
  };


  return (
    <div className="p-6 space-y-8">
      <AssignmentForm
        onAdd={addOrUpdateAssignment}
        editing={editing}
      />

      <AssignmentTable
        assignments={assignments}
        onDelete={deleteAssignment}
        onEdit={setEditing}
      />
    </div>
  );
}
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
  const res = await fetch("/api/assignments?sort=dueDate&order=asc", {
    credentials: "include"
  });

  if (!res.ok) {
    console.error("Failed to fetch assignments, res.status");
    return;
  }

  const json = await res.json();
  setAssignments(json.data);
};

useEffect(() => {
  fetchAssignments();
}, []);

const addOrUpdateAssignment = async (payload: any) => {
  console.log("PAYLOAD:", payload);

  const method = editing ? "PATCH" : "POST";
  const url = editing
    ? `/api/assignments/${editing.id}`
    : "/api/assignments";

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

console.log("STATUS:", res.status);

if (!res.ok) {
  console.error ("Failed to save assignment");
  return;
}

  await fetchAssignments();
  setEditing(null);
};

  const deleteAssignment = async (id: string) => {
    await fetch(`/api/assignments/${id}`, {
      method: "DELETE",
      credentials: "include",
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
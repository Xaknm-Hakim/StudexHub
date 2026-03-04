"use client";

import { useRouter } from "next/navigation";
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
  courseId: string | null;
  daysLeft: number;
  dueStatus: "OVERDUE" | "DUE_TODAY" | "DUE_IN_X_DAYS";
  course: {
    id: string;
    name: string;
    code: string | null;
    credit: number;
  } | null;
};

export default function AssignmentsPage() {
  const router = useRouter();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editing, setEditing] = useState<Assignment | null>(null);

  const fetchAssignments = async () => {
    const res = await fetch("/api/assignments?sort=dueDate&order=asc", {
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to fetch assignments:", res.status);
      return;
    }

    const json = await res.json();
    setAssignments(json.data);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const addOrUpdateAssignment = async (payload: any) => {
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
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error("Failed to save assignment:", res.status, err);
      return;
    }

    await fetchAssignments();
    setEditing(null); // exit edit mode properly
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
      <button
      onClick={() => router.push("/dashboard")}
      className="px-4 py-2 bg-black font-semibold text-white border-2 border-white rounded-full cursor-pointer hover:bg-white hover:text-black transition duration-300 ease-in-out ">
      ← Back to Dashboard
      </button>

      <AssignmentForm
        onAdd={addOrUpdateAssignment}
        editing={editing}
        onCancel={() => setEditing(null)}
      />

      <AssignmentTable
        assignments={assignments}
        onDelete={deleteAssignment}
        onEdit={setEditing}
      />
    </div>
  );
}
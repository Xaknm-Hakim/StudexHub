"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AssignmentTable from "@/components/AssignmentTable";
import AssignmentForm from "@/components/AssignmentForm";
import { CreateAssignmentBody } from "@/src/lib/types/requests";


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
  const [editing, setEditing] = useState<
  (CreateAssignmentBody & { id?: string }) | null
  >(null);

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
    const load = async () => {
      await fetchAssignments();
    };

    load();
  }, []);

  const addOrUpdateAssignment = async (payload: CreateAssignmentBody) => {
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
    
    <main className="min-h-screen bg-gradient-to-br from-mist-900 via-zinc-900 to-black text-white py-10">
      <div className="w-full mx-auto px-6 space-y-6">

          <h1 className="text-2xl font-bold text-center">Assignments</h1>
            <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-1 bg-black font-monospace text-white border-1 border-white rounded-lg cursor-pointer hover:bg-white hover:text-black transition duration-300 ease-in-out ">
                Main Page
            </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">  
            <div className="lg:col-span-1">    
                <AssignmentForm
                  onAdd={addOrUpdateAssignment}
                  editing={editing}
                  onCancel={() => setEditing(null)}
                />
            </div>
              <div className="lg:col-span-2">
                <AssignmentTable
                  assignments={assignments}
                  onDelete={deleteAssignment}
                  onEdit={(a) => {
                    const payload: CreateAssignmentBody = {
                      title: a.title,
                      dueDate: a.dueDate,
                      priority: a.priority,
                    };

                    if (a.notes !== null) {
                      payload.notes = a.notes;
                    }

                    setEditing(payload);
                    
                    }}
                />
            </div>
        </div>
      </div>
    </main>
  );
}
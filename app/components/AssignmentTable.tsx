"use client";


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

export default function AssignmentTable({
  assignments,
  onDelete,
  onEdit,
}: {
  assignments: Assignment[];
  onDelete: (id: string) => void;
  onEdit: (assignment: Assignment) => void;
}) {
  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.dueStatus === "OVERDUE")
      return (
        <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs">
          OVERDUE
        </span>
      );

    if (assignment.dueStatus === "DUE_TODAY")
      return (
        <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs">
          DUE TODAY
        </span>
      );
    return (
      <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
        {assignment.daysLeft} days left
      </span>
    );
  };

  const getPriorityBadge = (priority: "LOW" | "MEDIUM" | "HIGH") => {
  if (priority === "HIGH")
    return (
      <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs">
        HIGH
      </span>
    );

  if (priority === "MEDIUM")
    return (
      <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs">
        MEDIUM
      </span>
    );

  return (
    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
      LOW
    </span>
  );
};
  return (
    <div className="bg-zinc-800 rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold text-white">
        Upcoming Deadlines
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-400 border-b border-zinc-700">
            <tr>
              <th className="py-2">Assignment</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Notes</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="border-b border-zinc-700 text-zinc-200"
                >
                  <td className="py-3">{assignment.title}</td>

                  <td>
                    {new Date(
                      assignment.dueDate
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {getStatusBadge(assignment)}
                    </td>

                  <td>
                    {getPriorityBadge(assignment.priority)}
                  </td>

                  <td className="max-w-[200px] truncate">
                    {assignment.notes ?? "-"}
                  </td>

                  <td className="text-right space-x-2">
                    <button
                      onClick={() => onEdit(assignment)}
                      className="px-3 py-1 text-xs bg-blue-600 rounded hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(assignment.id)}
                      className="px-3 py-1 text-xs bg-red-600 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4 text-zinc-500"
                >
                  No assignments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
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
        <span className="px-2 py-1 rounded bg-red-100 text-red-600">
          OVERDUE
        </span>
      );

    if (assignment.dueStatus === "DUE_TODAY")
      return (
        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-600">
          DUE TODAY
        </span>
      );

    return (
      <span className="px-2 py-1 rounded bg-green-100 text-green-600">
        {assignment.daysLeft} days left
      </span>
    );
  };

  return (
    <div className="bg-zinc-100 shadow rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Upcoming Deadlines
      </h2>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-black">
            <th className="py-2">Assignment</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="border-b text-black">
              <td className="py-3">{assignment.title}</td>
              <td>
                {new Date(assignment.dueDate).toLocaleDateString()}
              </td>
              <td>{getStatusBadge(assignment)}</td>
              <td className="py-3">{assignment.title}</td>
              <td className="space-x-2">
                <button
                  onClick={() => onEdit(assignment)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(assignment.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

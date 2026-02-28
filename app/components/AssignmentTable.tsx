"use client";

type Assignment = {
  id: number;
  title: string;
  course: string;
  dueDate: string;
};

export default function AssignmentTable({
  assignments,
  onDelete,
  onEdit,
}: {
  assignments: Assignment[];
  onDelete: (id: number) => void;
  onEdit: (assignment: Assignment) => void;
}) {
  const today = new Date();

  const getStatusBadge = (dueDate: string) => {
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return <span className="px-2 py-1 rounded bg-red-100 text-red-600">Overdue</span>;

    if (diffDays === 0)
      return <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-600">Due Today</span>;

    return (
      <span className="px-2 py-1 rounded bg-green-100 text-green-600">
        {diffDays} days left
      </span>
    );
  };

  return (
    <div className="bg-zinc-100 shadow rounded-xl p-6 ">
      <h2 className="text-xl font-semibold mb-4 text-black">Upcoming Deadlines</h2>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-black">
            <th className="py-2">Assignment</th>
            <th>Course</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="border-b text-black">
              <td className="py-3">{assignment.title}</td>
              <td>{assignment.course}</td>
              <td>{assignment.dueDate}</td>
              <td>{getStatusBadge(assignment.dueDate)}</td>
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
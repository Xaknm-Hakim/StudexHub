"use client";

type ClassSchedule = {
  id: string;
  title: string;
  dayOfWeek: number;
  day: string;
  startTime: string;
  endTime: string;
  location: string | null;
};

type Props = {
  schedules: ClassSchedule[];
  onDelete: (id: string) => void;
};

export default function ScheduleTable({ schedules, onDelete }: Props) {
  if (schedules.length === 0) return <p>No schedules yet :p.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-zinc-700">
        <thead>
          <tr className="bg-zinc-800 text-left">
            <th className="px-4 py-2">Class</th>
            <th className="px-4 py-2">Day</th>
            <th className="px-4 py-2">Time</th>
            <th className="px-4 py-2">Location</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr key={s.id} className="border-t border-zinc-700">
              <td className="px-4 py-2">{s.title}</td>
              <td className="px-4 py-2">{s.day}</td>
              <td className="px-4 py-2">
                {s.startTime} - {s.endTime}
              </td>
              <td className="px-4 py-2">{s.location ?? "—"}</td>

              <td className="px-4 py-2 space-x-2">
                <button
                    className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600">
                Edit
                </button>

                <button
                    onClick={() => onDelete(s.id)}
                    className="px-3 py-1 bg-red-500 rounded hover:bg-red-600">
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
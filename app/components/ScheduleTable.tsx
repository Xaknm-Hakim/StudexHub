"use client";

type ClassSchedule = {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  day: string;
};

export default function ScheduleTable({
    schedules,
    onDelete,

}: {
    schedules: ClassSchedule[];
    onDelete: (id: string) => void;
}) {
    return (
        <div className="bg-zinc-100 shadow rounded-xl p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-black">
                Your Class Schedules
            </h2>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b text-black">
                        <th className="py-2">Title</th>
                        <th className="py-2">Day</th>
                        <th className="py-2">Time</th>
                        <th className="py-2">Location</th>
                        <th className="py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {schedules.map((schedule) => (
                        <tr key={schedule.id    } className="border-b text-black">
                            <td className="py-3">{schedule.title}</td>
                            <td>{schedule.day}</td>
                            <td>{schedule.startTime} - {schedule.endTime}</td>
                            <td>{schedule.location}</td>
                            <td>
                                <button 
                                    onClick={() => onDelete(schedule.id)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
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
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
  onEdit: (schedule: ClassSchedule) => void;
};

export default function ScheduleTable({ schedules, onDelete, onEdit }: Props) {
  if (schedules.length === 0) return <p>No schedules yet :p.</p>;

  const days = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  ]

  const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  ]
  
  //converting HH:MM to minutes
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  //Finding classes that covers this slot
  const getClassForSlot = (dayValue: number, slotTime: string) =>
    schedules.find((s) => {
      if (s.dayOfWeek !== dayValue) return false;
      const start = timeToMinutes(s.startTime);
      const end = timeToMinutes(s.endTime);
      const slot = timeToMinutes(slotTime);
      return slot >= start && slot < end;
    });

    return (
    <div className="overflow-x-auto">
      <table className="border border-zinc-700 w-full text-sm">
        <thead>
          <tr className="bg-zinc-800">
            <th className="p-2 border border-zinc-700">Day</th>
            {timeSlots.map((time) => (
              <th key={time} className="p-2 border border-zinc-700">
                {time}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {days.map((day) => (
            <tr key={day.value}>
              <td className="p-2 border border-zinc-700 font-semibold">{day.label}</td>

              {timeSlots.map((time) => {
                const cls = getClassForSlot(day.value, time);

                // No class here
                if (!cls) return <td key={time} className="p-2 border border-zinc-700 h-20"></td>;

                // Only render at the start of the class
                if (cls.startTime !== time) return null;

                const startMinutes = timeToMinutes(cls.startTime);
                const endMinutes = timeToMinutes(cls.endTime);
                const colSpan = (endMinutes - startMinutes) / 60;

                return (
                  <td
                    key={time}
                    colSpan={colSpan}
                    className="p-2 border border-zinc-700 h-20 align-top"
                  >
                    <div className="bg-zinc-800 rounded p-1 text-xs">
                      <div className="font-semibold">{cls.title}</div>
                      <div className="text-zinc-400">{cls.location ?? ""}</div>
                      <div className="mt-1 flex gap-1">
                        <button
                          onClick={() => onEdit(cls)}
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(cls.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
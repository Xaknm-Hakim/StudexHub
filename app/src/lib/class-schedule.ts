export const WEEKDAY_MAP = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
} as const;

export function isValidDayOfWeek(dayOfWeek: number) {
  return Number.isInteger(dayOfWeek) && dayOfWeek >= 1 && dayOfWeek <= 5;
}

export function isValidTimeString(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function hasValidTimeRange(startTime: string, endTime: string) {
  return timeToMinutes(startTime) < timeToMinutes(endTime);
}

export function schedulesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return aStart < bEnd && aEnd > bStart;
}

export function formatClassSchedule(schedule: {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...schedule,
    day: WEEKDAY_MAP[schedule.dayOfWeek as keyof typeof WEEKDAY_MAP] ?? "Unknown",
  };
}

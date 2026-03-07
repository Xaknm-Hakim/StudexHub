export const SEMESTER_LABELS: Record<number, string> = {
  0: "Special Semester",
  1: "Year 1 Semester 1",
  2: "Year 1 Semester 2",
  3: "Year 2 Semester 1",
  4: "Year 2 Semester 2",
  5: "Year 3 Semester 1",
};

export function isValidSemesterSlot(value: unknown): value is number {
  return Number.isInteger(value) && value >= 0 && value <= 5;
}

export function getSemesterName(slot: number): string {
  return SEMESTER_LABELS[slot] ?? "Unknown Semester";
}

export const SEMESTER_OPTIONS = Object.entries(SEMESTER_LABELS).map(
  ([slot, name]) => ({
    slot: Number(slot),
    name,
  })
);

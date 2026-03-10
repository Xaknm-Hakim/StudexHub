export type SemesterStat = {
  semesterId: string;
  name: string;
  year: number | null;
  gpa: number | null;
  credits: number;
};

export type Summary = {
  cgpa: number | null;
  totalCredits: number;
  semesterStats: SemesterStat[];
};
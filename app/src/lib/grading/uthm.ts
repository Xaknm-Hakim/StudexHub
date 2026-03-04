// src/lib/grading/uthm.ts
export type GradeResult = { grade: string; point: number };

const MAP_40_TO_79: Record<number, GradeResult> = {
  79: { grade: "A-", point: 3.94 },
  78: { grade: "A-", point: 3.88 },
  77: { grade: "A-", point: 3.82 },
  76: { grade: "A-", point: 3.76 },
  75: { grade: "A-", point: 3.7 },

  74: { grade: "B+", point: 3.62 },
  73: { grade: "B+", point: 3.54 },
  72: { grade: "B+", point: 3.46 },
  71: { grade: "B+", point: 3.38 },
  70: { grade: "B+", point: 3.3 },

  69: { grade: "B", point: 3.24 },
  68: { grade: "B", point: 3.18 },
  67: { grade: "B", point: 3.12 },
  66: { grade: "B", point: 3.06 },
  65: { grade: "B", point: 3.0 },

  64: { grade: "B-", point: 2.94 },
  63: { grade: "B-", point: 2.88 },
  62: { grade: "B-", point: 2.82 },
  61: { grade: "B-", point: 2.76 },
  60: { grade: "B-", point: 2.7 },

  59: { grade: "C+", point: 2.62 },
  58: { grade: "C+", point: 2.54 },
  57: { grade: "C+", point: 2.46 },
  56: { grade: "C+", point: 2.38 },
  55: { grade: "C+", point: 2.3 },

  54: { grade: "C", point: 2.24 },
  53: { grade: "C", point: 2.18 },
  52: { grade: "C", point: 2.12 },
  51: { grade: "C", point: 2.06 },
  50: { grade: "C", point: 2.0 },

  49: { grade: "C-", point: 1.9 },
  48: { grade: "C-", point: 1.8 },
  47: { grade: "C-", point: 1.7 },
  46: { grade: "C-", point: 1.6 },
  45: { grade: "C-", point: 1.5 },

  44: { grade: "D", point: 1.4 },
  43: { grade: "D", point: 1.3 },
  42: { grade: "D", point: 1.2 },
  41: { grade: "D", point: 1.1 },
  40: { grade: "D", point: 1.0 },
};

export function markToGradePoint(markInput: number): GradeResult {
  const mark = Math.floor(markInput);

  if (!Number.isFinite(mark) || mark < 0 || mark > 100) {
    throw new Error("mark must be an integer between 0 and 100");
  }

  if (mark >= 85) return { grade: "A+", point: 4.0 };
  if (mark >= 80) return { grade: "A", point: 4.0 };
  if (mark <= 39) return { grade: "E", point: 0.0 };

  const exact = MAP_40_TO_79[mark];
  if (!exact) throw new Error(`No mapping found for mark ${mark}`);
  return exact;
}

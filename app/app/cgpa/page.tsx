"use client";

import { useState, useEffect, } from "react";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  name: string;
  code?: string;
  credit: number;
  mark?: number;
  gradePoint?: number;
  semester: { id: string; slot: number; name: string };
};

type Semester = { slot: number; name: string };

export const semesterOptions: Semester[] = [
  { slot: 0, name: "Special Semester" },
  { slot: 1, name: "Year 1 Semester 1" },
  { slot: 2, name: "Year 1 Semester 2" },
  { slot: 3, name: "Year 2 Semester 1" },
  { slot: 4, name: "Year 2 Semester 2" },
  { slot: 5, name: "Year 3 Semester 1" },
];

export default function CgpaPage() {
  const router = useRouter();

  const [semesterSlot, setSemesterSlot] = useState<number>(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [gpa, setGpa] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", credit: "", mark: "" });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  useEffect (() => {
    const fetchCourses = async () => {
      try {
    const res = await fetch("/api/courses");
    if (!res.ok) throw new Error("Failed to fetch courses");

    // Type-safe response
    interface CoursesResponse {
      courses: Course[];
    }

    const data: CoursesResponse = await res.json();

    // Filter courses by selected semesterSlot safely
    const filtered = data.courses.filter(
      (c: Course) => c.semester?.slot === semesterSlot
    );
    setCourses(filtered);

    // Fetch GPA if at least one course exists
    if (filtered.length > 0 && filtered[0].semester?.id) {
      await fetchGpa(filtered[0].semester.id);
    } else {
      setGpa(null);
    }
  } catch (err) {
    console.error("Error fetching courses:", err);
    alert("Failed to fetch courses. Check console for details.");
    setCourses([]);
    setGpa(null);
  }
};

fetchCourses();
  }, [semesterSlot]);
  
async function fetchCourses() {
  try {
    const res = await fetch("/api/courses");
    if (!res.ok) throw new Error("Failed to fetch courses");

    // Type-safe response
    interface CoursesResponse {
      courses: Course[];
    }

    const data: CoursesResponse = await res.json();

    // Filter courses by selected semesterSlot safely
    const filtered = data.courses.filter(
      (c: Course) => c.semester?.slot === semesterSlot
    );
    setCourses(filtered);

    // Fetch GPA if at least one course exists
    if (filtered.length > 0 && filtered[0].semester?.id) {
      await fetchGpa(filtered[0].semester.id);
    } else {
      setGpa(null);
    }
  } catch (err) {
    console.error("Error fetching courses:", err);
    alert("Failed to fetch courses. Check console for details.");
    setCourses([]);
    setGpa(null);
  }
}

  async function fetchGpa(semesterId: string) {
    try {
      const res = await fetch(`/api/semesters/${semesterId}/gpa`);
      if (!res.ok) return setGpa(null);
      const data = await res.json();
      setGpa(data.gpa);
    } catch {
      setGpa(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: formData.name,
      code: formData.code || undefined,
      credit: Number(formData.credit),
      mark: formData.mark ? Number(formData.mark) : undefined,
      semesterSlot,
    };

    try {
      let res;
      if (editingCourseId) {
        res = await fetch(`/api/courses/${editingCourseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save course");
      setFormData({ name: "", code: "", credit: "", mark: "" });
      setEditingCourseId(null);
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Error saving course. Check console.");
    }
  }

  async function handleDelete(courseId: string) {
    if (!confirm("Delete this course?")) return;
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Error deleting course.");
    }
  }

  function handleEdit(course: Course) {
    setFormData({
      name: course.name,
      code: course.code || "",
      credit: course.credit.toString(),
      mark: course.mark?.toString() || "",
    });
    setEditingCourseId(course.id);
  }

{/*below this are the visible buttons on the page (mostly for styling) */}

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex justify-center p-8">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
      <button
      onClick={() => router.push("/dashboard")}
        className="px-4 py-2 bg-black border-2 border-white rounded-full hover:bg-white hover:text-black transition "
      >
      go back :3
      </button>
      <h1 className="text-3xl font-bold">CGPA Dashboard</h1>
        </div>

        {/*Below is the existing button, above is the headers section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-800 p-4 rounded-xl">
          <label className="block text-sm text-zinc-400 mb-2">Select Semester:</label>
          
          <select
            value={semesterSlot}
            onChange={e => setSemesterSlot(Number(e.target.value))}
            className="w-full p-2 rounded bg-zinc-900"
          >
            {semesterOptions.map(s => (
              <option key={s.slot} value={s.slot}>{s.name}</option>
            ))}
          </select>
        
      </div>
          <div className="bg-zinc-800 p-4 rounded-xl text-center">
            <p className="text-sm text-zinc-400"> Semester GPA</p>
            <p className="text-3xl font-bold">{gpa !== null ? gpa.toFixed(2) : "N/A"}</p>
            </div>
      </div>  
      <div className="mb-6 text-lg">
        Semester GPA: <span className="font-bold">{gpa !== null ? gpa.toFixed(2) : "N/A"}</span>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="bg-zinc-800 p-6 rounded-xl space-y-4 w-full"
        >
          <div className="grid grid-cols-2 gap-3">
            
        <input placeholder="Course Name" required value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 rounded bg-zinc-800 border-2 border-white" />

        <input placeholder="Course Code (optional)" value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value })}
          className="w-full p-2 rounded bg-zinc-800 border-2 border-white" />

        <input type="number" placeholder="Credit" required value={formData.credit}
          onChange={e => setFormData({ ...formData, credit: e.target.value })}
          className="w-full p-2 rounded bg-zinc-800 border-2 border-white" />

        <input type="number" placeholder="Mark (optional)" value={formData.mark}
          onChange={e => setFormData({ ...formData, mark: e.target.value })}
          className="w-full p-2 rounded bg-zinc-800 border-2 border-white" />

          
          </div>
        <button
         type="submit" 
         className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
         >
          {editingCourseId ? "Update Course" : "Add Course"}
        </button>
      </form>
    <div className="bg-zinc-800 p-4 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr 
          className="border-b border-zinc-700 hover:bg-zinc-900">
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Code</th>
            <th className="p-2">Credit</th>
            <th className="p-2">Mark</th>
            <th className="p-2">Grade</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.length === 0 ? (
            <tr><td colSpan={6} className="text-center p-4">No courses yet.</td></tr>
          ) : courses.map(course => (
            <tr key={course.id} className="border-b border-zinc-700">
              <td className="p-2">{course.name}</td>
              <td className="p-2">{course.code || "-"}</td>
              <td className="p-2 text-center">{course.credit}</td>
              <td className="p-2 text-center">{course.mark ?? "-"}</td>
              <td className="p-2 text-center">{course.gradePoint ?? "-"}</td>
              <td className="p-2 flex gap-2 justify-center">
                <button onClick={() => handleEdit(course)} className="px-2 py-1 bg-yellow-600 rounded hover:bg-yellow-700">Edit</button>
                <button onClick={() => handleDelete(course.id)} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
    </main>
  );
}
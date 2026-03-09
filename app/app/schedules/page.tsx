"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ScheduleForm from "@/components/ScheduleForm"
import ScheduleTable from "@/components/ScheduleTable"

type ClassSchedule = {
  id: string
  title: string
  dayOfWeek: number
  startTime: string
  endTime: string
  location: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  day: string
};

export default function SchedulePage() {
  const router = useRouter()

  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  

  // Fetch schedules from the API
  async function fetchSchedules() {
    const res = await fetch("/api/class-schedules")
    const data = await res.json()
    setSchedules(data)
  }

  useEffect(() => {
    fetchSchedules()
  }, [])


  //creating a schedule
  async function fetchSchedules(){
    endTime.preventDefault();
    await fetch("/api/class-schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dayOfWeek, startTime, endTime, location }),
  });
  setTitle("");
  setDayOfWeek(1);
  setStartTime("");
  setEndTime("");
  setLocation("");
  fetchSchedules();

  
  async function handleDelete(id: string) {
    await fetch(`/api/class-schedules/${id}`, {
      method: "DELETE",
    })

    fetchSchedules()
  }

  return (
    <main className="p-6 text-white">

      <h1 className="text-2xl font-bold mb-6">
        Class Schedule
      </h1>

      <ScheduleForm onSuccess={fetchSchedules} />

      <ScheduleTable
        schedules={schedules}
        onDelete={handleDelete}
      />

    </main>
  )
}
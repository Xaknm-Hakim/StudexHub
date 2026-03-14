"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import type { Notification } from "@/src/lib/types/notification"

export default function NotificationBell() {
  const router = useRouter()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  async function fetchNotifications() {
    const res = await fetch("/api/notifications")
    const data = await res.json()

    setNotifications(data.notifications)
    setUnreadCount(data.unreadCount)
  }

  useEffect(() => {
    fetchNotifications()

    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  async function handleClick(notification: Notification) {
    await fetch(`/api/notifications/${notification.id}/read`, {
      method: "PATCH"
    })

    if (notification.assignmentId) {
      router.push(`/assignments`)
    } else {
      router.push("/schedule")
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", {
      method: "PATCH"
    })

    fetchNotifications()
  }

  return (
    <div className="relative">
      
      {/* Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg">

          <div className="flex justify-between items-center p-3 border-b border-zinc-700">
            <span className="font-semibold">Notifications</span>

            <button
              onClick={markAllRead}
              className="text-xs text-blue-400"
            >
              Mark all
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">

            {notifications.length === 0 && (
              <div className="p-4 text-sm text-zinc-400">
                No notifications
              </div>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`p-3 cursor-pointer border-b border-zinc-800 hover:bg-zinc-800
                ${!n.isRead ? "bg-zinc-800/40" : ""}`}
              >
                <div className="font-medium text-sm">
                  {n.title}
                </div>

                <div className="text-xs text-zinc-400 mt-1">
                  {n.message}
                </div>
              </div>
            ))}

          </div>

        </div>
      )}
    </div>
  )
}
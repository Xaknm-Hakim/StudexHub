"use client"

import { useEffect, useState } from "react"
import NotificationDropdown from "./NotificationDropdown"

type Notification = {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  async function loadNotifications() {
    const res = await fetch("/api/notifications")
    const data = await res.json()

    setNotifications(data.notifications)
    setUnreadCount(data.unreadCount)
  }

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
    })

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    )

    setUnreadCount((prev) => Math.max(prev - 1, 0))
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", {
      method: "PATCH",
    })

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    )

    setUnreadCount(0)
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  return (
    <div className="relative">

      {/* Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-xl"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <NotificationDropdown
          notifications={notifications}
          onMarkRead={markAsRead}
          onMarkAll={markAllRead}
        />
      )}

    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import NotificationDropdown from "./NotificationDropdown"
import { useRouter } from "next/navigation"

type Notification = {
  id: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleNotificationClick(n: Notification) {
    await markAsRead(n.id)
    if (n.link) router.push(n.link)
  }
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
  
    const interval = setInterval(loadNotifications, 30000)

    return () => clearInterval(interval)
  }, [])
  

  return (
    <div className="relative">

      {/* Bell */}
      <button
        onClick={() => { 
          setOpen(!open)
          if (!open) loadNotifications()
        }}
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
          onClickNotification={handleNotificationClick}
        />
      )}

    </div>
  )
}
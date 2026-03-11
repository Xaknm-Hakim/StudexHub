"use client"

type Notification = {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

type Props = {
    notifications: Notification[]
    onMarkRead: (id:string) => void
    onMarkAll: () => void
}

export default function NotificationDropdown({
    notifications,
    onMarkRead,
    onMarkAll,
}: Props) {
    return (
        <div className="absolute right-0 mt-3 w-80 bg-zinc-900 boder border-zinc-700 rounded-lg shadow-lg">

            {/* Header */}
            <div className="flex justify-between items-center p-3 border0b border-zinc-700">
                <p className="font-semibold"> Notifucations</p>

                <button
                onClick={onMarkAll}
                className="text-xs text-blue-400 hover:underline">
                    Mark All
                </button>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto">

                {notifications.length === 0 && (
                    <p className="p-4 text-sm text-zinc-400">
                        No Notifications
                    </p>
                )}

                {notifications.map((n) => (
                    <div
                    key={n.id}
                    onClick={() => onMarkRead(n.id)}
                    className={`p-3 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800 transition
                        ${!n.isRead ? "bg-zinc-800 font-semibold" : "opacity-70"}`}
                    >
                        <p className="text-sm">{n.title}</p>
                        <p className="text-xs text-zinc-400 mt-1">
                            {n.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
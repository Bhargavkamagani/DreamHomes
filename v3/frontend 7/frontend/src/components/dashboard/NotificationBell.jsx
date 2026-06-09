import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Bell } from 'lucide-react'
import { fetchNotifications, markNotificationsRead } from '../../services/gharService.js'
import { playNotificationSound, unlockNotificationAudio } from '../../utils/notificationSounds.js'

function showBrowserNotification(notification) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(notification.title, { body: notification.body })
}

export default function NotificationBell() {
  const { accessToken } = useSelector((state) => state.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [notificationList, setNotificationList] = useState([])
  const [pollingEnabled, setPollingEnabled] = useState(true)
  const initializedRef = useRef(false)
  const knownNotificationIdsRef = useRef(new Set())

  const unreadCount = notificationList.filter((notification) => !notification.is_read).length

  const loadNotifications = async () => {
    if (!accessToken || !pollingEnabled) {
      setNotificationList([])
      return
    }

    const nextNotifications = await fetchNotifications().catch((error) => {
      if (error.response?.status === 401) {
        setPollingEnabled(false)
      }
      return []
    })
    const dashboardNotifications = nextNotifications.filter((notification) => notification.module !== 'message')
    const nextIds = new Set(dashboardNotifications.map((notification) => notification.id))
    const newNotifications = dashboardNotifications.filter((notification) => !knownNotificationIdsRef.current.has(notification.id))

    if (initializedRef.current && newNotifications.length) {
      const newestNotification = newNotifications[0]
      playNotificationSound(newestNotification.module).catch(() => {})
      showBrowserNotification(newestNotification)
    }

    knownNotificationIdsRef.current = nextIds
    initializedRef.current = true
    setNotificationList(dashboardNotifications)
  }

  const toggleNotifications = async () => {
    setIsOpen((currentValue) => !currentValue)
    unlockNotificationAudio().catch(() => {})
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
    await loadNotifications()
  }

  const markAllAsRead = async () => {
    if (!accessToken || !pollingEnabled) return
    await markNotificationsRead().catch((error) => {
      if (error.response?.status === 401) {
        setPollingEnabled(false)
      }
    })
    await loadNotifications()
  }

  useEffect(() => {
    if (!accessToken) {
      setNotificationList([])
      return undefined
    }
    setPollingEnabled(true)
    initializedRef.current = false
    knownNotificationIdsRef.current = new Set()
  }, [accessToken])

  useEffect(() => {
    if (!accessToken || !pollingEnabled) return undefined
    loadNotifications()
    const pollingId = window.setInterval(loadNotifications, 8000)
    return () => window.clearInterval(pollingId)
  }, [accessToken, pollingEnabled])

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-forest-700 shadow-sm ring-1 ring-black/5"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-warm px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-forest-50 px-4 py-3">
            <p className="font-display text-sm font-bold text-graphite">Notifications</p>
            <button onClick={markAllAsRead} className="text-xs font-bold text-forest-700">Mark all read</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notificationList.map((notification) => (
              <div key={notification.id} className={`border-b border-forest-50 px-4 py-3 ${notification.is_read ? 'bg-white' : 'bg-forest-50/70'}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-graphite">{notification.title}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-forest-700 ring-1 ring-forest-100">
                    {notification.module}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-graphite/60">{notification.body}</p>
                <p className="mt-2 text-[10px] font-semibold text-graphite/40">{notification.created_at}</p>
              </div>
            ))}
            {!notificationList.length && (
              <div className="px-4 py-10 text-center">
                <p className="font-display text-sm font-bold text-graphite">No notifications</p>
                <p className="mt-1 text-xs text-graphite/50">Request, supplier, contractor, and project alerts appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

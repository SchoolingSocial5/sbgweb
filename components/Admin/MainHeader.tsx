import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { usePathname, useRouter } from 'next/navigation'
import NotificationStore from '@/src/zustand/notification/Notification'
import { MessageStore } from '@/src/zustand/notification/Message'
import ExpenseStore from '@/src/zustand/Expenses'
import { Monitor } from 'lucide-react'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import useSocket from '@/src/useSocket'

export default function MainHeader() {
  const { toggleVNav, setHeaderHeight } = NavStore()
  const { page_size, notifications, uniqueCount, activitiesCount, getNotifications } = NotificationStore()
  const { latestExpenses, getLatestExpenses } = ExpenseStore()
  const { unread } = NotificationStore()
  const socket = useSocket()
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isOutOfView, setIsOutOfView] = useState(false)
  const divRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!socket) return
    if (user) {
      const form = {
        staffName: user.fullName,
        staffUsername: user.username,
        page: pathname.replace('/admin/', ''),
        createdAt: new Date(),
      }
      socket.emit(`message`, { to: 'activity', form })
    }
  }, [pathname, user, socket])

  useEffect(() => {
    if (divRef.current) {
      setHeaderHeight(divRef.current.offsetHeight)
    }
  }, [])

  useEffect(() => {
    if (latestExpenses.length === 0) {
      getLatestExpenses(`/expenses?page_size=5&ordering=-createdAt`)
    }
  }, [])

  useEffect(() => {
    if (notifications.length === 0) {
      const params = `?page_size=${page_size}&page=1&ordering=${sort}`
      getNotifications(`/notifications/${params}`, setMessage)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && lastScrollY > 100) {
        setShowHeader(false)
        setIsOutOfView(true)
      } else if (currentScrollY < lastScrollY && isOutOfView) {
        setShowHeader(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY, isOutOfView])

  return (
    // <div
    //   ref={divRef}
    //   className="w-full flex z-30 border-b border-b-[var(--border)] sticky top-0 justify-center bg-[var(--white)] py-2"
    // >

    <div
      ref={divRef}
      className={`w-full flex fixed md:sticky top-0 left-0 justify-center transition-transform duration-300 ease-in-out ${showHeader ? 'translate-y-0' : '-translate-y-full sm:-translate-y-0'
        } bg-[var(--white)] py-2 z-40 border-b border-[var(--border-color)]`}
    >
      <div className="custom_container">
        <div className="flex relative">
          <span onClick={toggleVNav} className="headerCircle hfs">
            <i className="bi bi-text-left text-lg text-[var(--text-primary)]"></i>
          </span>
          {pathname !== '/admin' && (
            <div onClick={() => router.back()} className="headerCircle top">
              <i className="bi bi-arrow-left common-icon"></i>
            </div>
          )}
          <Link href={'/admin/staff-activities'} className="headerCircle top">
            {activitiesCount > 0 && (
              <span className="dot_notification left">
                {activitiesCount > 9 ? '9+' : activitiesCount}
              </span>
            )}
            <Monitor size={16} />
            {uniqueCount > 0 && (
              <span className="dot_notification">
                {uniqueCount > 9 ? '9+' : uniqueCount}
              </span>
            )}
          </Link>
          <div className="mr-auto"></div>

          <Link href="/" className="block absoluteCenter">
            <Image
              style={{ height: 'auto' }}
              src="/Icon.png"
              loading="lazy"
              sizes="100vw"
              className="w-8"
              width={0}
              height={0}
              alt="Paragon Logo"
            />
          </Link>

          <Link href="/admin/profile" className="headerCircle">
            <i className="bi bi-person common-icon"></i>
          </Link>
          <Link href="/admin/notifications" className="headerCircle">
            {unread > 0 && (
              <span className="dot_notification">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
            <i className="bi bi-bell common-icon"></i>
          </Link>
        </div>
      </div>
    </div>
  )
}

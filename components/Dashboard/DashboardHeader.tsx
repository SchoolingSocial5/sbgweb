import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { NavStore } from '@/src/zustand/notification/Navigation'
import NotificationStore from '@/src/zustand/notification/Notification'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useParams, useRouter } from 'next/navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import TransactionStore from '@/src/zustand/Transaction'

export default function DashboardHeader() {
  const { toggleVNav, setHeaderHeight } = NavStore()
  const { page_size, notifications, unread, getNotifications } =
    NotificationStore()
  const { getLatestTransactions, latest } = TransactionStore()
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isOutOfView, setIsOutOfView] = useState(false)
  const divRef = useRef<HTMLDivElement | null>(null)
  const { page } = useParams()
  const router = useRouter()

  useEffect(() => {
    if (divRef.current) {
      setHeaderHeight(divRef.current.offsetHeight)
    }
  }, [])

  useEffect(() => {
    if (latest.length === 0) {
      getLatestTransactions(
        `/expenses?page_size=5&username=${user?.username}&ordering=-createdAt`
      )
    }
  }, [])

  useEffect(() => {
    if (notifications.length === 0) {
      const params = `?page_size=${page_size}&page=${
        page ? page : 1
      }&ordering=-createdAt&username=${user?.username}`
      getNotifications(`/notifications/${params}`, setMessage)
    }
  }, [page])

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
      className={`w-full flex fixed md:sticky top-0 left-0 justify-center transition-transform duration-300 ease-in-out ${
        showHeader ? 'translate-y-0' : '-translate-y-full sm:-translate-y-0'
      } bg-[var(--white)] py-2 z-40 border-b border-[var(--border-color)]`}
    >
      <div className="custom_container">
        <div className="flex relative">
          <span onClick={toggleVNav} className="headerCircle hfs">
            <i className="bi bi-text-left text-lg text-[var(--text-primary)]"></i>
          </span>
          <div onClick={() => router.back()} className="headerCircle top">
            <i className="bi bi-arrow-left common-icon"></i>
          </div>
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

          <Link href="/dashboard/notifications" className="headerCircle">
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

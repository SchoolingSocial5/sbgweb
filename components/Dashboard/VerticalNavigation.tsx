import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useSwipeable } from 'react-swipeable'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import {
  Gauge,
  User,
  ArrowLeftRight,
  Boxes,
  Settings,
  Bell,
} from 'lucide-react'
import ThemeToggle from '../Admin/ThemeToggle'

export default function DashboardNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { toggleVNav, vNav, clearNav } = NavStore()
  const { user } = AuthStore()

  const offStates = () => {
    clearNav()
  }

  useEffect(() => {
    // loadUserFromStorage();
    offStates()
  }, [router, pathname])

  const handlers = useSwipeable({
    onSwipedLeft: toggleVNav,
  })

  return (
    <div
      onClick={toggleVNav}
      className={` ${
        vNav ? 'left-0' : 'left-[-100%]'
      } md:border-r-0 md:w-[270px] overflow-auto fixed  h-[100vh] top-0 md:z-30 z-50 w-full flex transition-all  md:left-0 justify-start md:sticky`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        {...handlers}
        className="v_nav_card nav"
      >
        <div className="flex items-start pt-2">
          {user && user.picture ? (
            <Image
              className="object-cover rounded-full mr-2"
              src={String(user.picture)}
              loading="lazy"
              alt="username"
              sizes="100vw"
              height={0}
              width={0}
              style={{ height: '50px', width: '50px' }}
            />
          ) : (
            <Image
              className="object-cover rounded-full mr-2"
              src={'/images/avatar.jpg'}
              loading="lazy"
              alt="username"
              sizes="100vw"
              height={0}
              width={0}
              style={{ height: '50px', width: '50px' }}
            />
          )}
          <div>
            <div className="text-lg mb-1">Welcome back</div>
            <div className="text-[var(--customRedColor)]">
              {' '}
              {`@${user?.username}`}
            </div>
          </div>
        </div>

        <div className="flex py-1">{user?.staffPositions}</div>

        <div className="mt-4">
          <Link
            className="v_nav_items hover:text-[var(--customColor)] flex items-center"
            href="/dashboard"
          >
            <Gauge className="mr-3 w-5 h-5" />
            Dashboard
          </Link>

          <Link
            className="v_nav_items hover:text-[var(--customColor)] flex items-center"
            href="/dashboard/profile"
          >
            <User className="mr-3 w-5 h-5" />
            Profile
          </Link>
          <Link
            className="v_nav_items hover:text-[var(--customColor)] flex items-center"
            href="/dashboard/transactions"
          >
            <ArrowLeftRight className="mr-3 w-5 h-5" />
            Transactions
          </Link>

          <Link
            className="v_nav_items hover:text-[var(--customColor)] flex items-center"
            href="/dashboard/products"
          >
            <Boxes className="mr-3 w-5 h-5" />
            Products
          </Link>
          {/* <Link
            className="v_nav_items hover:text-[var(--customColor)] flex items-center"
            href="/dashboard/review"
          >
            <MessageCircle className="mr-3 w-5 h-5" />
            Make Review
          </Link> */}

          <Link
            className="v_nav_items hover:text-[var(--customColor)] flex items-center"
            href="/dashboard/notifications"
          >
            <Bell className="mr-3 w-5 h-5" />
            Notification
          </Link>
          <Link
            className="v_nav_items hover:text-[var(--customColor)] flex items-center"
            href="/dashboard/settings"
          >
            <Settings className="mr-3 w-5 h-5" />
            Settings
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}

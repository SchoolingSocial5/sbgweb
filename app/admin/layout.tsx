'use client'
import '../../styles/team/team.css'
import '../../styles/users/main.css'
import '../../styles/utility.css'
import Response from '../../components/Messages/Response'
// import { playPopSound } from '@/lib/sound'
import UserAlert from '@/components/Messages/UserAlert'
import { MessageStore } from '@/src/zustand/notification/Message'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import VerticalNavigation from '@/components/Admin/VerticalNavigation'
import MainHeader from '@/components/Admin/MainHeader'
import useSocket from '@/src/useSocket'
import TransactionStore, { Transaction } from '@/src/zustand/Transaction'
import NotificationStore, {
  Notification,
} from '@/src/zustand/notification/Notification'
import ProductStore from '@/src/zustand/Product'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { playPopSound } from '@/lib/sound'
import { useRouter } from 'next/navigation'

interface Active {
  counts: { totalActivities: number, uniqueUserCount: number }
}
interface TxData {
  notification: Notification
  transaction: Transaction
  unread: number
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // const { transactions, isNotification } = TransactionStore()
  const { buyingProducts, getBuyingProducts } = ProductStore()
  const { message, setMessage } = MessageStore()
  const { headerHeight } = NavStore()
  const [isMd, setIsMd] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const socket = useSocket()
  const { user } = AuthStore()

  const positions = ["Director", "Manager", "Cashier"]

  useEffect(() => {
    if (buyingProducts.length === 0) {
      const params = `?page_size=20&page=1&ordering=name&isBuyable=true`
      getBuyingProducts(`/products/${params}`, setMessage)
    }
  }, [pathname])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 990px)')
    setIsMd(media.matches)

    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches)
    media.addEventListener('change', handler)

    return () => media.removeEventListener('change', handler)
  }, [pathname])

  useEffect(() => {
    if (!user) return
    const pos = user.staffPositions?.toLowerCase() || ''
    if (pos === 'general' || pos === 'director') return

    const menuMapping: Record<string, string> = {
      '/admin/activities/purchase': 'Purchase Products',
      '/admin/activities': 'Sell Products',
      '/admin/transactions': 'Transactions',
      '/admin/operations': 'Operation',
      '/admin/products': 'Products',
      '/admin/customers': 'Customers',
      '/admin/security': 'Security',
      '/admin/socials': 'Monthly Strategy',
      '/admin/pages': 'Pages',
      '/admin/company': 'Company',
    }

    // Check exact matches first (for sub-paths)
    for (const [path, label] of Object.entries(menuMapping)) {
      if (pathname.startsWith(path)) {
        if (!pos.includes(label.toLowerCase())) {
          router.push('/admin/profile')
        }
        return
      }
    }

    // Special check for root admin dash
    if (pathname === '/admin') {
      if (!pos.includes('dashboard')) {
        router.push('/admin/profile')
      }
    }
  }, [pathname, user, router])


  useEffect(() => {
    if (!socket) return
    socket.on(`admin`, (data: Active) => {
      if (data.counts) {
        NotificationStore.setState({ activitiesCount: data.counts.totalActivities, uniqueCount: data.counts.uniqueUserCount })
      }
    })
    return () => {
      socket.off(`admin`)
    }
  }, [socket])

  useEffect(() => {
    if (!socket) return
    if (!user) return
    socket.on(`purchase`, (data: TxData) => {
      if (positions.includes(user.staffPositions)) {

        if (user.playSound) {
          playPopSound()
        }

        TransactionStore.setState((prev) => {
          return {
            transactions: [data.transaction, ...prev.transactions],
          }
        })
        NotificationStore.setState((prev) => {
          return {
            notifications: [data.notification, ...prev.notifications],
            unread: data.unread,
          }
        })
      }

    })
    return () => {
      socket.off(`purchase`)
    }
  }, [socket])

  return (
    <>
      {message !== null && <Response />}

      {/* {display && <UploadFile />} */}
      <UserAlert />

      <div className="body-content w-full flex justify-center">
        <div className="w-full">
          <div className="flex w-full">
            <VerticalNavigation />
            <div className="flex-1 md:pb-0 md:pl-5 overflow-x-auto md:overflow-visible">
              <MainHeader />
              {/* <div className="pt-5 flex-1"> */}
              <div
                style={{
                  marginTop: isMd ? 0 : `${headerHeight}px`,
                  minHeight: `calc(100vh - ${headerHeight}px)`,
                }}
                className={`md:pt-5 sm:mr-3  flex flex-col flex-1`}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

'use client'
import '../../styles/team/team.css'
import '../../styles/users/main.css'
import '../../styles/users/onboard.css'
import '../../styles/utility.css'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { NavStore } from '@/src/zustand/notification/Navigation'
import PublicHeader from '@/components/Public/PublicHeader'
import PublicNavbar from '@/components/Public/PublicNavbar'
import PublicFooter from '@/components/Public/PublicFooter'
import UserResponse from '@/components/Messages/UserResponse'
import UserAlert from '@/components/Messages/UserAlert'
import Link from 'next/link'
import PageLoader from '@/components/Public/PageLoader'
import ProductStore from '@/src/zustand/Product'
import BlogStore from '@/src/zustand/Blog'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { setShowHeader, setHeaderHeight } = NavStore()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const lastScrollY = useRef(0)
  const isOutOfView = useRef(false)
  const { cartProducts } = ProductStore()
  const { blogs } = BlogStore()

  // const [isMd, setIsMd] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const currentScrollY = container.scrollTop

      if (currentScrollY > lastScrollY.current && lastScrollY.current > 100) {
        // Scrolling down
        setShowHeader(false)
        isOutOfView.current = true
      } else if (currentScrollY < lastScrollY.current && isOutOfView.current) {
        // Scrolling up
        setShowHeader(true)
        isOutOfView.current = false
      }

      lastScrollY.current = currentScrollY
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (pathname.includes('/home/friends')) {
      setHeaderHeight(0)
    }
    const media = window.matchMedia('(min-width: 767px)')
    // setIsMd(media.matches)

    const handler = (e: MediaQueryListEvent) => console.log(e.matches)
    media.addEventListener('change', handler)

    return () => media.removeEventListener('change', handler)
  }, [pathname])
  return (
    <>
      <PageLoader />
      <UserResponse />
      <UserAlert />
      <PublicHeader />
      <PublicNavbar />
      <div className={`${blogs.length > 0 ? "h-auto" : "min-h-[100vh]"} text-[var(--dark)] bg-white`}> {children}</div>
      {cartProducts.length > 0 && (
        <Link
          href={'/check-out'}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex justify-center items-center fixed cursor-pointer bottom-4 right-4 bg-[var(--customColor)]  text-white md:w-15 md:h-15 w-10 h-10 z-50 rounded shadow-lg transition"
          aria-label="Scroll to Top"
        >
          <i className="bi bi-cart3 text-[20px]"></i>
          <div className="w-[20px] h-[20px] text-sm flex justify-center items-center rounded-full top-0 right-0 absolute text-white bg-[var(--customRedColor)]">
            {cartProducts.length > 9 ? '9+' : cartProducts.length}
          </div>
        </Link>
      )}

      <PublicFooter />
    </>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useSwipeable } from 'react-swipeable'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import CompanyStore from '@/src/zustand/app/Company'
import ThemeToggle from './ThemeToggle'
import {
  Gauge,
  Users,
  FileArchive,
  CreditCard,
  ArrowLeftRight,
  Boxes,
  Settings,
  Wrench,
  HeartHandshake,
  Lock,
} from 'lucide-react'

export default function VerticalNavigation() {
  const pathname = usePathname()
  const { toggleVNav, vNav, clearNav } = NavStore()
  const { user } = AuthStore()
  const { companyForm } = CompanyStore()

  useEffect(() => {
    // loadUserFromStorage();
    clearNav()
  }, [pathname, clearNav])

  const handlers = useSwipeable({
    onSwipedLeft: toggleVNav,
  })

  const canSee = (menuName: string) => {
    if (!user) return false
    const position = user.staffPositions || ''
    const roles = user.roles || ''

    if (position === 'CEO' || position === 'Director') return true
    if (position === 'Manager') {
      return menuName !== 'Company'
    }

    return roles.toLowerCase().includes(menuName.toLowerCase())
  }

  return (
    <div
      onClick={toggleVNav}
      className={` ${vNav ? 'left-0' : 'left-[-100%]'
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

        {/* <div className="flex py-1">{user?.staffPositions}</div> */}

        <div className="mt-4">
          {canSee("Dashboard") && <Link
            className={`${pathname === '/admin' ? 'text-[var(--customRedColor)]' : ''
              } v_nav_items hover:text-[var(--customRedColor)] flex items-center`}
            href="/admin"
          >
            <Gauge className="mr-3 w-5 h-5" />
            Dashboard
          </Link>}
          {canSee("Sell Products") && <Link
            className={`${pathname === '/admin/activities'
              ? 'text-[var(--customRedColor)]'
              : ''
              } v_nav_items hover:text-[var(--customRedColor)] flex items-center`}
            href="/admin/activities"
          >
            <ArrowLeftRight className="mr-3 w-5 h-5" />
            Sell Products
          </Link>}
          {canSee("Purchase Products") && <Link
            className={`${pathname === '/admin/activities/purchase'
              ? 'text-[var(--customRedColor)]'
              : ''
              } v_nav_items hover:text-[var(--customRedColor)] flex items-center`}
            href="/admin/activities/purchase"
          >
            <CreditCard className="mr-3 w-5 h-5" />
            Purchase Products
          </Link>}

          {canSee("Transactions") && <div className={`v_nav_items active trip`}>
            <div
              className={`hover:text-[var(--customRedColor)] flex cursor-pointer items-center py-3`}
            >
              <Link
                className="flex flex-1 items-center"
                href="/admin/transactions"
              >
                <CreditCard className="mr-3 w-5 h-5" />
                Transactions
              </Link>
            </div>
            <div className="nav_dropdown">
              {(canSee("Transaction Status")) && <Link
                className="inner_nav_items"
                href="/admin/transactions/status"
              >
                Transaction Status
              </Link>}
              {canSee("Transactions") && <>
                <Link
                  className="inner_nav_items"
                  href="/admin/transactions/purchases"
                >
                  Purchase Transactions
                </Link>
                <Link
                  className="inner_nav_items"
                  href="/admin/operations/expenses"
                >
                  Expenses
                </Link></>}
            </div>
          </div>}

          {canSee("Operation") && <div className={`v_nav_items active`}>
            <div
              className={`hover:text-[var(--customRedColor)] flex cursor-pointer items-center py-3`}
            >
              <Link
                className="flex flex-1 items-center"
                href="/admin/operations"
              >
                <Wrench className="mr-3 w-5 h-5" />
                Operation
              </Link>
            </div>

            <div className="nav_dropdown">
              {(canSee("Daily Production")) && <Link
                className="inner_nav_items"
                href="/admin/operations/productions"
              >
                Daily Production
              </Link>}
              {(canSee("Daily Consumption")) && <Link
                className="inner_nav_items"
                href="/admin/operations/consumptions"
              >
                Daily Consumption
              </Link>}
              {(canSee("Daily Mortality")) && <Link
                className="inner_nav_items"
                href="/admin/operations/mortality"
              >
                Daily Mortality
              </Link>}
              {(canSee("Daily Services")) && <Link
                className="inner_nav_items"
                href="/admin/operations/services"
              >
                Daily Services
              </Link>}
            </div>
          </div>}

          {canSee("Products") && <div className={`v_nav_items active two`}>
            <div
              className={`flex hover:text-[var(--customRedColor)] cursor-pointer items-center py-3 ${pathname.includes('products')
                ? 'text-[var(--customRedColor)]'
                : ''
                }`}
            >
              <Boxes className="mr-3 w-5 h-5" />
              Products
            </div>
            <div className="nav_dropdown">
              {canSee("Products") && <Link className="inner_nav_items" href="/admin/products">
                Product Records
              </Link>}
              {(canSee("Stocks")) && <Link className="inner_nav_items" href="/admin/products/stocks">
                Stocks
              </Link>}
            </div>
          </div>}

          {canSee("Customers") && <div className={`v_nav_items active two`}>
            <div
              className={`${pathname.includes('/admin/customers')
                ? 'text-[var(--customRedColor)]'
                : ''
                }  hover:text-[var(--customRedColor)] flex cursor-pointer items-center py-3`}
            >
              <Link
                className="flex flex-1 items-center"
                href="/admin/customers"
              >
                <Users className="mr-3 w-5 h-5" />
                Customers
              </Link>
            </div>
            <div className="nav_dropdown">
              <Link className="inner_nav_items" href="/admin/customers">
                Customers Table
              </Link>
              <Link className="inner_nav_items" href="/admin/customers/reviews">
                Customer Reviews
              </Link>

            </div>
          </div>}

          {canSee("Security") && <div className={`v_nav_items active two`}>
            <div
              className={`${pathname.includes('/admin/security')
                ? 'text-[var(--customRedColor)]'
                : ''
                }  hover:text-[var(--customRedColor)] flex cursor-pointer items-center py-3`}
            >
              <div
                className="flex flex-1 items-center"
              >
                <Lock className="mr-3 w-5 h-5" />
                Security
              </div>
            </div>
            <div className="nav_dropdown">
              <Link
                className="inner_nav_items"
                href="/admin/security/equipments"
              >
                Equipment Report
              </Link>
              <Link
                className="inner_nav_items"
                href="/admin/security"
              >
                Visitors
              </Link>
            </div>
          </div>}

          {canSee("Monthly Strategy") && <div className={`v_nav_items active trip`}>
            <div
              className={`hover:text-[var(--customRedColor)] flex cursor-pointer items-center py-3`}
            >
              <div
                className="flex flex-1 items-center"
              >
                <HeartHandshake className="mr-3 w-5 h-5" />
                Monthly Strategy
              </div>
            </div>
            <div className="nav_dropdown">
              <Link className="inner_nav_items" href="/admin/socials/strategies">
                Monthly Strategy
              </Link>
              {(canSee("Social Reports")) && <Link className="inner_nav_items" href="/admin/socials">
                Social Reports
              </Link>}
              {(canSee("Marketing Reports")) && <Link className="inner_nav_items" href="/admin/socials/marketing">
                Marketing Reports
              </Link>}
            </div>
          </div>}

          {canSee("Pages") && <div className={`v_nav_items active`}>
            <div
              className={`flex cursor-pointer ${pathname.includes('pages') ? 'text-[var(--customRedColor)]' : ''
                } hover:text-[var(--customRedColor)] items-center py-3`}
            >
              <FileArchive className="mr-3 w-5 h-5" />
              Pages

            </div>
            <div className="nav_dropdown">
              <Link
                className="inner_nav_items hover:text-[var(--customColor)]"
                href="/admin/pages/blog"
              >
                Blog
              </Link>

              <Link
                className="inner_nav_items hover:text-[var(--customColor)]"
                href="/admin/pages/faq"
              >
                FAQ
              </Link>
              <Link className="inner_nav_items" href="/admin/pages/emails">
                Emails
              </Link>
              <Link
                className="inner_nav_items"
                href="/admin/pages/notification-templates"
              >
                Notifications
              </Link>
              {/* <Link
                className="inner_nav_items hover:text-[var(--customColor)]"
                href="/admin/pages/terms"
              >
                Terms
              </Link> */}
            </div>
          </div>}

          {canSee("Company") && <div className={`v_nav_items active`}>
            <div
              className={`hover:text-[var(--customRedColor)] flex cursor-pointer items-center py-3 ${pathname.includes('company')
                ? 'text-[var(--customRedColor)]'
                : ''
                }`}
            >
              <Settings className="mr-3 w-5 h-5" />
              Company
            </div>
            <div className="nav_dropdown">
              {(canSee("CEO") || canSee("Director")) && <Link className="inner_nav_items" href="/admin/company">
                Set Company
              </Link>}
              <Link className="inner_nav_items" href="/admin/company/positions">
                Positions
              </Link>
              <Link className="inner_nav_items" href="/admin/finances">
                Finances
              </Link>
              <Link className="inner_nav_items" href="/admin/company/salary">
                Salary
              </Link>
              {companyForm.allowApplicant && (
                <Link className="inner_nav_items" href="/admin/company/applications">
                  Submitted Applications
                </Link>
              )}
              <Link className="inner_nav_items" href="/admin/company/staffs">
                Staffs
              </Link>
            </div>
          </div>}
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}
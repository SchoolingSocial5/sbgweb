'use client'
import Link from 'next/link'
import Image from 'next/image'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { FaFacebookF, FaTwitter, FaYoutube, FaLinkedinIn } from 'react-icons/fa'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import CompanyStore from '@/src/zustand/app/Company'

export default function PublicNavbar() {
  const pathName = usePathname()
  const { vNav, clearNav } = NavStore()
  const { user } = AuthStore()
  const { companyForm } = CompanyStore()
  const router = useRouter()

  const logout = () => {
    AuthStore.getState().logout()
    router.replace('/')
  }

  useEffect(() => {
    clearNav()
  }, [pathName, user])

  const closeNave = (e: React.MouseEvent) => {
    e.stopPropagation()
    clearNav()
  }

  return (
    <nav className="bg-[var(--customColor)] sm:sticky sm:top-0 z-30 text-white flex justify-center">
      <div className="custom-container">
        <div
          onClick={closeNave}
          className={`${vNav ? 'left-0' : 'left-[-1000px] md:left-0'
            } md:relative fixed  top-0 h-full bg-black/65 md:bg-transparent w-full z-50`}
        >
          <ul className="md:flex bg-[var(--customColor)] md:w-full  w-[250px]  h-full">
            <li className="md:hidden pt-4 px-3 mb-5">
              <Link href="/" className="sm:w-40 w-32 max-w-40">
                <Image
                  style={{ height: 'auto' }}
                  src="/paragonLogo.png"
                  loading="lazy"
                  sizes="100vw"
                  className="sm:w-40 w-32"
                  width={0}
                  height={0}
                  alt="Paragon Logo"
                />
              </Link>
            </li>
            <li>
              <Link
                className={`navLinks ${pathName === '/' ? 'bg-[var(--customRedColor)]' : ''
                  }`}
                href={`/`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                className={`navLinks ${pathName === '/about' ? 'bg-[var(--customRedColor)]' : ''
                  }`}
                href={`/about`}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                className={`navLinks ${pathName === '/products' ? 'bg-[var(--customRedColor)]' : ''
                  }`}
                href={`/products`}
              >
                Products
              </Link>
            </li>
            {/* <li>
              <Link
                className={`navLinks ${
                  pathName === '/services'
                    ? 'bg-[var(--custom-light-color)]'
                    : ''
                }`}
                href={`/services`}
              >
                Services
              </Link>
            </li> */}
            <li>
              <Link
                className={`navLinks ${pathName === '/faq' ? 'bg-[var(--customRedColor)]' : ''
                  }`}
                href={`/faq`}
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                className={`navLinks ${pathName === '/contact' ? 'bg-[var(--customRedColor)]' : ''
                  }`}
                href={`/contact`}
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                className={`navLinks ${pathName.includes('/blog') ? 'bg-[var(--customRedColor)]' : ''
                  }`}
                href={`/blog`}
              >
                Blog
              </Link>
            </li>
            {companyForm.allowApplicant && (
              <li>
                <Link
                  className={`navLinks ${pathName.includes('/application') ? 'bg-[var(--customRedColor)]' : ''
                    }`}
                  href={`/application`}
                >
                  Application
                </Link>
              </li>
            )}
            {user ? (
              <>
                <li className="ml-auto">
                  <Link
                    className={`navLinks ${pathName === '/sign-up'
                      ? 'bg-[var(--customRedColor)]'
                      : ''
                      }`}
                    href={user.status === 'Staff' ? `/admin` : '/dashboard'}
                  >
                    {user.status === 'Staff' ? 'Admin' : 'Dashboard'}
                  </Link>
                </li>
                <li onClick={logout} className="cursor-pointer">
                  <div
                    className={`navLinks ${pathName === '/sign-in'
                      ? 'bg-[var(--customRedColor)]'
                      : 'bg-[var(--customDarkColor)]'
                      }`}
                  >
                    Logout
                  </div>
                </li>
              </>
            ) : (
              <>
                {companyForm.allowSignUp && (
                  <>
                    <li className="ml-auto">
                      <Link
                        className={`navLinks ${pathName === '/sign-up'
                          ? 'bg-[var(--customRedColor)]'
                          : ''
                          }`}
                        href={`/sign-up`}
                      >
                        Sign Up
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`navLinks ${pathName === '/sign-in'
                          ? 'bg-[var(--customRedColor)]'
                          : 'bg-[var(--customDarkColor)]'
                          }`}
                        href={`/sign-in`}
                      >
                        Sign In
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </div>
        <ul className="flex md:hidden items-center w-full">
          <li className="sm:flex justify-start gap-4 text-white hidden">
            <FaFacebookF />
            <FaTwitter />
            <FaYoutube />
            <FaLinkedinIn />
          </li>
          {companyForm.allowSignUp && (
            <>
              <li className="ml-auto">
                <Link
                  className={`navLinks ${pathName === '/sign-up' ? 'bg-[var(--custom-light-color)]' : ''
                    }`}
                  href={`/sign-up`}
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  className={`navLinks bg-[var(--custom-light-color)]`}
                  href={`/sign-in`}
                >
                  Sign In
                </Link>
              </li>
            </>
          )}
        </ul>
        {/* </div> */}
      </div>
    </nav>
  )
}

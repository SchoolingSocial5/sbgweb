'use client'
import Link from 'next/link'
import Image from 'next/image'
import { FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { EnvelopeIcon } from '@heroicons/react/24/solid'
import { NavStore } from '@/src/zustand/notification/Navigation'
import BlogStore from '@/src/zustand/Blog'
import { useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import CompanyStore from '@/src/zustand/app/Company'
import ProductStore from '@/src/zustand/Product'
import { UserStore } from '@/src/zustand/user/User'
import RatingStore from '@/src/zustand/Rating'
import FaqStore from '@/src/zustand/faq'

export default function PublicHeader() {
  const { toggleVNav } = NavStore()
  const { setMessage } = MessageStore()
  const { getBanners, getGallery, getBlogs, getInstaBlogs, getAbout } = BlogStore()
  const { getCompany, companyForm } = CompanyStore()
  const { getProducts } = ProductStore()
  const { getUsers } = UserStore()
  const { getRatings } = RatingStore()
  const { getFaqs } = FaqStore()

  useEffect(() => {
    getBanners(`/blogs?category=Home-Banner`, setMessage)
    getCompany(`/company`, setMessage)
    getProducts(
      `/products?ordering=-createdAt&page_size=20&isBuyable=false`,
      setMessage
    )
    getUsers(`/users/?status=Staff&ordering=-staffRanking`, setMessage)
    getRatings(`/reviews/?ordering=-createdAt`, setMessage)
    getFaqs(`/faqs/?ordering=createdAt&page_size=100`, setMessage)
    getInstaBlogs(`/blogs/?ordering=-createdAt&page_size=6&category=Instagram`,)
    getAbout(`/blogs/?ordering=-createdAt&page_size=1&category=About`,)
    getGallery(
      `/blogs?category=Gallery&ordering=-createdAt&page_size=20`,
      setMessage
    )
    getBlogs(
      `/blogs?category=Blog&ordering=-createdAt&page_size=20`,
      setMessage
    )
  }, [])
  return (
    <header className="bg-[var(--backgroundColor)] border-b border-b-gray-300 sticky top-0 sm:relative z-30 text-[var(--primaryTextColor)] py-1 flex justify-center">
      <div className="custom-container">
        <div className="flex justify-between w-full items-center">
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

          <div className="md:flex text-sm hidden">
            <div className="flex items-start gap-2">
              <FaMapMarkerAlt
                size={37}
                className="text-[var(--customColor)] text-base lg:text-xl"
              />
              <div>
                <p className="font-semibold text-[var(--secondaryTextColor)] text-base">
                  Our Head Office
                </p>
                <p>{companyForm.headquaters}</p>
              </div>
            </div>

            <div className="flex items-start ml-2 lg:ml-5 gap-2">
              <FaPhoneAlt
                size={30}
                className="text-[var(--customColor)] text-base lg:text-xl"
              />
              <div>
                <p className="font-bold text-[var(--secondaryTextColor)] text-base">
                  {companyForm.phone}
                </p>
                <p>24/7 Customer Support</p>
              </div>
            </div>

            <div className="flex items-start ml-2 lg:ml-5 gap-2">
              <EnvelopeIcon
                width={40}
                className="text-[var(--customColor)] text-base lg:text-xl"
              />
              <div>
                <p className="font-bold text-[var(--secondaryTextColor)] text-base">
                  Send Mail
                </p>
                <p>{companyForm.email}</p>
              </div>
            </div>
          </div>

          <i
            onClick={toggleVNav}
            className="bi bi-list font-bold md:hidden text-3xl text-[var(--customColor)] cursor-pointer"
          ></i>
        </div>
      </div>
    </header>
  )
}

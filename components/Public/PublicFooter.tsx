'use client'
import Link from 'next/link'
import Image from 'next/image'
import CompanyStore from '@/src/zustand/app/Company'
import ProductStore from '@/src/zustand/Product'
import { formatMoney } from '@/lib/helpers'
import BlogStore from '@/src/zustand/Blog'

export default function PublicFooter() {
  const { companyForm } = CompanyStore()
  const { products } = ProductStore()
  const { instaBlogs } = BlogStore()

  return (
    <>
      <div className="flex py-[90px] justify-center bg-[var(--secondaryCustomColor)] relative">
        <Image
          src="/images/poultryFooter.jpg"
          sizes="100vw"
          className="h-full w-full object-cover absolute z-0 top-0 left-0"
          width={0}
          height={0}
          alt="paragon"
        />
        <div className="customContainer">
          <div className="grid gap-3 md:grid-cols-4 w-full px-[10px]">
            <div className="flex flex-col mb-8 md:mb-0">
              <Image
                style={{ height: 'auto' }}
                src="/paragonLogo.png"
                loading="lazy"
                sizes="100vw"
                className="sm:w-70 w-[250px] mb-4"
                width={0}
                height={0}
                alt="Paragon Logo"
              />
              <div className="text-sm mb-3 text-[var(--secondaryTextColor)]">
                {companyForm.finalInstruction}
              </div>
            </div>
            <div className="flex flex-col mb-8 md:mb-0">
              <div className="text-[var(--primaryTextColor)] text-[26px] font-bold mb-4">
                Keep In Touch
              </div>
              <div className="flex">
                <i className="bi bi-telephone-fill mb-2 text-[var(--customColor)] mr-3"></i>
                <div className="flex flex-col">
                  <div className="text-[var(--secondaryTextColor)]">
                    {companyForm.phone}
                  </div>
                  <div className="text text-[var(--secondaryTextColor)] mb-4">
                    {companyForm.email}
                  </div>
                </div>
              </div>
              <div className="flex">
                <i className="bi bi-clock mb-2 text-[var(--customColor)] mr-3"></i>
                <div className="flex flex-col">
                  <div className="text-[var(--secondaryTextColor)]">
                    Mon - Fri 09:00 - 18:00
                  </div>
                  <div className="text text-[var(--secondaryTextColor)] mb-4">
                    (except public sundays)
                  </div>
                </div>
              </div>
              <div className="flex">
                <i className="bi bi-geo-alt-fill mb-2 text-[var(--customColor)] mr-3"></i>
                <div className="flex flex-col">
                  <div className="text-[var(--secondaryTextColor)]">
                    {companyForm.headquaters}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col mb-8 md:mb-0">
              <div className="text-[var(--primaryTextColor)] text-[26px] font-bold mb-4">
                Poultry Farm Product
              </div>
              {products.slice(0, 3).map((item, i) => (
                <div key={i} className="flex">
                  <Image
                    src={String(item.picture)}
                    sizes="100vw"
                    className="h-[70px] w-[85px] mr-3 object-contain"
                    width={0}
                    height={0}
                    alt="real"
                  />
                  <div className="flex flex-col mb-7">
                    <div className="hover:text-[var(--secondaryTextColor)] text-[var(--primaryTextColor)] font-semibold">
                      {item.name}
                    </div>
                    <div className="text text-[var(--primaryTextColor)]/70 mb-4">
                      ₦{formatMoney(item.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="text-[var(--primaryTextColor)] text-[28px] mb-4 font-bold">
                Instagram Feed
              </div>
              <div className="grid grid-cols-3 md:gap-3 gap-3 w-full">
                {instaBlogs.slice(0, 6).map((item, i) => (
                  <Image
                    key={i}
                    src={String(item.picture)}
                    sizes="100vw"
                    className="h-[80px] w-full object-cover"
                    width={0}
                    height={0}
                    alt="real"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center py-[50px] bg-[var(--backgroundColor)]">
        <div className="customContainer">
          <div className="flex justify-center flex-wrap">
            <i className="bi bi-c-circle mr-1"></i>
            <div className="text-[var(--primaryCustomColor)] mr-2 font-bold">
              {new Date().getFullYear()}
            </div>
            <div className="text-[var(--customColor)] mr-1 font-bold">
              {companyForm.name}
            </div>
            <div className="text-[var(--primaryCustomColor)] text-[15px] mx-2 font-bold">
              All Rights Reserved By
            </div>
            <Link className="text-[var(--customColor)]" href={'/'}>
              Kenny Tech Studios
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

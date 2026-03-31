import React from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

function Welcome() {
  const pathname = usePathname()
  return (
    <div className="flex justify-center bg-[var(--backgroundColor)] py-[75px]">
      <div className="customContainer">
        <div className="grid md:grid-cols-2 gap-3 px-[12px]">
          <Image
            src="/images/poultryFamily.png"
            sizes="100vw"
            className="h-full w-full object-contain"
            width={0}
            height={0}
            alt="real"
          />
          <div className="flex flex-col items-start">
            <div className="md:text-[40px] text-[25px] text-[var(--primaryTextColor)] font-bold mb-6">
              Welcome to Our Poultry And Egg Farm.
            </div>

            <div className="text-[var(--secondaryTextColor)] mb-6">
              We are dedicated to producing the freshest eggs and healthiest
              poultry through sustainable farming practices. Our mission is to
              deliver nutritious, farm-fresh products straight from our barns to
              your table with care and quality you can trust.
            </div>

            <div className="flex items-center mb-3">
              <div className="text-[var(--customColor)] mr-2">
                <i className="bi bi-check2-square"></i>
              </div>
              <div className="text-[var(--secondaryTextColor)]">
                Fresh, organic eggs collected daily
              </div>
            </div>

            <div className="flex items-center mb-3">
              <div className="text-[var(--customColor)] mr-2">
                <i className="bi bi-check2-square"></i>
              </div>
              <div className="text-[var(--secondaryTextColor)]">
                Ethically raised and well-nurtured poultry
              </div>
            </div>

            <div className="flex items-center mb-3">
              <div className="text-[var(--customColor)] mr-2">
                <i className="bi bi-check2-square"></i>
              </div>
              <div className="text-[var(--secondaryTextColor)]">
                Sustainable and eco-friendly farming methods
              </div>
            </div>

            <div className="flex items-center mb-3">
              <div className="text-[var(--customColor)] mr-2">
                <i className="bi bi-check2-square"></i>
              </div>
              <div className="text-[var(--secondaryTextColor)]">
                Guaranteed freshness and high-quality products
              </div>
            </div>

            <div className="flex items-center mb-3">
              <div className="text-[var(--customColor)] mr-2">
                <i className="bi bi-check2-square"></i>
              </div>
              <div className="text-[var(--secondaryTextColor)]">
                Trusted by local markets and loyal customers alike
              </div>
            </div>

            {pathname !== '/about' && (
              <Link
                href={'/about'}
                className="text-white text-[15px] rounded bg-[var(--customColor)] px-[22px] py-[13px] font-bold cursor-pointer hover:opacity-90 transition"
              >
                READ MORE
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome

'use client'
import Image from 'next/image'

export default function Qualities() {
  return (
    <div className="flex py-[120px] bg-[var(--backgroundColor)] justify-center">
      <div className="customContainer text-center">
        <div className="grid md:grid-cols-4 gap-5 w-full">
          <div className="flex flex-col items-center py-20 px-8 border-[3px] border-gray-100/40">
            <Image
              src="/images/range.png"
              sizes="100vw"
              className="h-auto w-[65px] mb-3"
              width={0}
              height={0}
              alt="Product Range"
            />
            <div className="text-[var(--primaryTextColor)] text-[20px] hover:text-[var(--customColor)] mb-3 font-bold">
              Product Range
            </div>
            <div className="text-[var(--secondaryTextColor)] text-center">
              Explore a wide variety of poultry products — from fresh eggs to
              premium quality meat, all in one place.
            </div>
          </div>

          <div className="flex flex-col items-center border-[3px] border-gray-100/40 py-20 px-8">
            <Image
              src="/images/quality.png"
              sizes="100vw"
              className="h-auto w-[65px] mb-3"
              width={0}
              height={0}
              alt="Quality Matters"
            />
            <div className="text-[var(--primaryTextColor)] text-[20px] hover:text-[var(--customColor)] mb-3 font-bold">
              Quality Matters
            </div>
            <div className="text-[var(--secondaryTextColor)] text-center">
              High standards of hygiene and freshness to
              ensure every product meets your expectations.
            </div>
          </div>

          <div className="flex flex-col items-center border-[3px] border-gray-100/40 py-20 px-8">
            <Image
              src="/images/shipping.png"
              sizes="100vw"
              className="h-auto w-[65px] mb-3"
              width={0}
              height={0}
              alt="Fast Delivery"
            />
            <div className="text-[var(--primaryTextColor)] text-[20px] hover:text-[var(--customColor)] mb-3 font-bold">
              Fast Delivery
            </div>
            <div className="text-[var(--secondaryTextColor)] text-center">
              Enjoy reliable, on-time delivery — keeping your poultry supplies
              fresh and your business running smoothly.
            </div>
          </div>

          <div className="flex flex-col items-center border-[3px] border-gray-100/40 py-20 px-8">
            <Image
              src="/images/card.png"
              sizes="100vw"
              className="h-auto w-[65px] mb-3"
              width={0}
              height={0}
              alt="Affordable Pricing"
            />
            <div className="text-[var(--primaryTextColor)] text-[20px] hover:text-[var(--customColor)] mb-3 font-bold">
              Affordable Pricing
            </div>
            <div className="text-[var(--secondaryTextColor)] text-center">
              Get premium poultry products at fair prices — quality you can
              trust without breaking the bank.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import React from 'react'
import Link from 'next/link'

export const PageHeader = ({
  page,
  title,
}: {
  page: string
  title: string
}) => {
  return (
    <div className="relative">
      {/* <Image
        src="/images/page-header.jpg"
        sizes="100vw"
        className="h-full w-full object-cover absolute z-0"
        width={0}
        height={0}
        alt="paragon"
      /> */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/videos/poultry-birds.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-0" />
      <div className="flex w-full justify-center">
        <div className="customContainer relative z-10">
          <div className="flex items-center flex-col z-20 min-h-[45vh] justify-center">
            <div className="text-white md:text-[35px] text-[28px] font-bold mb-[8px]">
              {title}
            </div>
            <div className="flex items-center">
              <Link href={'/'} className="text-white text-[17px] mb-[3px] mr-1">
                Home /
              </Link>
              <div className="text-[var(--customColor)] text-[17px]">
                {page}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import BlogStore from '@/src/zustand/Blog'

export default function Hero() {
  const { banners } = BlogStore()

  return (
    <section className=" flex relative w-full justify-center">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        spaceBetween={0}
        slidesPerView={1}
        speed={1500}
        loop={true}
        className="w-full transition-transform duration-1000 ease-in-out"
      >
        {banners.map((item, index) => (
          <SwiperSlide key={index}>
            <Image
              src={String(item.picture)}
              sizes="100vw"
              className="h-full w-full object-cover absolute z-0"
              width={0}
              height={0}
              alt="paragon"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-0" />
            <div className="flex w-full justify-center">
              <div className="customContainer relative z-10">
                <div className="flex lg:text-[48px] text-2xl items-center flex-col z-20 min-h-[80vh] justify-center text-center">
                  <div className="text-white text-4xl lg:text-5xl font-bold mb-5">
                    {item.title}
                  </div>
                  <div className="text-white mb-10 leading-[35px] md:leading-[55px] max-w-[550px]">
                    {item.subtitle}
                  </div>

                  <Link
                    href={'/'}
                    className="text-white rounded bg-[var(--customColor)] text-[13px] px-[20px] py-[10px] font-bold"
                  >
                    DICOVER NOW
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

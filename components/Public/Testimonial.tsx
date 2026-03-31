import React from 'react'
import Image from 'next/image'
import RatingStore from '@/src/zustand/Rating'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

function Testimonial() {
  const { ratings } = RatingStore()

  return (
    <div className="flex justify-center py-[90px]">
      <div className="customContainer">
        <div className="flex flex-col items-center">
          <div className="flex flex-col text-center max-w-[550px] mb-10">
            <div className="text-[30px] text-[var(--primaryTextColor)] mb-2 font-bold">
              What Client Say Our Poultry Farm
            </div>
            <div className="text-[16px] text-[var(--secondaryTextColor)]">
              Our customers are at the heart of everything we do. From farm to
              table, we ensure every product reflects care and quality. Hear
              what our happy clients say about our poultry farm.
            </div>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            spaceBetween={10}
            slidesPerView={5} // Default for desktop
            slidesPerGroup={1}
            loop={true}
            speed={800} // Smooth transition speed (in ms)
            breakpoints={{
              0: { slidesPerView: 1 }, // 📱 Mobile (2 slides)
              640: { slidesPerView: 2 }, // 📱 Tablets (3 slides)
              1024: { slidesPerView: 3 }, // 💻 Desktops (5 slides)
            }}
            className="w-full"
          >
            {ratings.map((item, index) => (
              <SwiperSlide className="p-3" key={index}>
                <div
                  key={index}
                  className="flex flex-col items-start shadow py-7 px-6 bg-[var(--backgroundColor)]"
                >
                  <div className="flex mb-7">
                    <Image
                      src={String(item.picture)}
                      sizes="100vw"
                      className="h-auto w-[90px] object-contain mr-5"
                      width={0}
                      height={0}
                      alt="real"
                    />
                    <div className="flex flex-col">
                      <div className="text-[var(--primaryTextColor)] hover:text-[var(--customColor)] font-bold text-[20px]">
                        {item.fullName}
                      </div>
                      <div className="text-[15px] text-[var(--secondaryTextColor)] font-semibold">
                        Awiza Customer
                      </div>
                      <div className="flex text-[15px] font-bold">
                        <i className="bi bi-star text-[var(--customColor)] mr-1"></i>
                        <i className="bi bi-star text-[var(--customColor)]  mr-1"></i>
                        <i className="bi bi-star text-[var(--customColor)]  mr-1"></i>
                        <i className="bi bi-star text-[var(--customColor)]  mr-1"></i>
                        <i className="bi bi-star text-[var(--customColor)]  mr-1"></i>
                      </div>
                    </div>
                  </div>
                  <i className="bi bi-quote mb-2 text-[var(--secondaryTextColor)]/50"></i>
                  <div className="text-[var(--secondaryTextColor)] mb-1">
                    {item.review}
                  </div>
                  <i className="bi bi-quote"></i>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

        </div>
      </div>
    </div>
  )
}

export default Testimonial

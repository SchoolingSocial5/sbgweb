'use client'
import Link from 'next/link'
import Hero from '@/components/Public/Hero'
import Image from 'next/image'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import Welcome from '@/components/Public/Welcome'
import Testimonial from '@/components/Public/Testimonial'
import BlogStore from '@/src/zustand/Blog'
import { UserStore } from '@/src/zustand/user/User'
import Products from '@/components/Public/Products'
import Qualities from '@/components/Public/Qualities'

export default function Home() {
  const { blogs, gallery } = BlogStore()
  const { users } = UserStore()
  return (
    <div>
      <Hero />

      {/* ///////WELCOME SECTION//////////// */}
      <Welcome />

      {/* ///////PRODUCTS SECTION//////////// */}
      <div className="flex justify-center py-[90px] bg-[var(--secondaryCustomColor)]">
        <div className="customContainer">
          <div className="flex flex-col items-center">
            <div className="flex flex-col text-center max-w-[450px] mb-[70px]">
              <div className="text-[30px] text-[var(--primaryTextColor)] mb-2 font-bold">
                Poultry Farm Products
              </div>
              <div className="text-[16px] text-[var(--secondaryTextColor)] ">
                Delivering fresh, healthy, and ethically raised poultry products
                straight from our farm to your table.
              </div>
            </div>
            <Products />
            <Link
              className="text-[20px] text-white bg-[var(--customColor)] rounded py-[10px] px-[30px]"
              href={'/'}
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-center py-[90px] bg-[var(--backgroundColor)]">
        <div className="customContainer">
          <div className="flex flex-col items-center">
            <div className="flex flex-col text-center max-w-[550px] mb-[70px]">
              <div className="text-[30px] text-[var(--primaryTextColor)] mb-2 font-bold">
                Poultry Farm Services
              </div>
              <div className="text-[16px] text-[var(--secondaryTextColor)] ">
                Delivering sustainable poultry solutions and innovative farming practices to ensure the highest quality products for your family and business.
              </div>
            </div>

            <div className="grid md:grid-cols-3 w-full gap-7">
              <div className="flex flex-col shadow py-[15px] px-[25px]">
                <div className="flex mb-6 items-center">
                  <Image
                    src="/images/service1.png"
                    sizes="100vw"
                    className="h-auto w-[50px] object-contain mr-4"
                    width={0}
                    height={0}
                    alt="real"
                  />
                  <div className="text-[var(--primaryTextColor)] text-[20px] font-bold hover:text-[var(--customColor)]">
                    Premium Egg
                  </div>
                </div>
                <div className="text-[var(--secondaryTextColor)]">
                  We provide farm-fresh, nutrient-dense eggs produced under the strictest hygiene standards and organic feeding protocols
                </div>
              </div>
              <div className="flex flex-col shadow py-[15px] px-[25px]">
                <div className="flex mb-6 items-center">
                  <Image
                    src="/images/service2.png"
                    sizes="100vw"
                    className="h-auto w-[50px] object-contain mr-4"
                    width={0}
                    height={0}
                    alt="real"
                  />
                  <div className="text-[var(--primaryTextColor)] text-[20px] font-bold hover:text-[var(--customColor)]">Live Bird Supply</div>
                </div>
                <div className="text-[var(--secondaryTextColor)]">
                  Health-certified broilers and layers raised in a stress-free environment, ensuring premium meat quality and high productivity.
                </div>
              </div>
              <div className="flex flex-col shadow py-[15px] px-[25px]">
                <div className="flex mb-6 items-center">
                  <Image
                    src="/images/service3.png"
                    sizes="100vw"
                    className="h-auto w-[50px] object-contain mr-4"
                    width={0}
                    height={0}
                    alt="real"
                  />
                  <div className="text-[var(--primaryTextColor)] text-[20px] font-bold hover:text-[var(--customColor)]">
                    Elite Day-Old Chicks
                  </div>
                </div>
                <div className="text-[var(--secondaryTextColor)]">
                  Sourcing and distributing high-performance breeds with superior genetics to give your poultry farm a head start.
                </div>
              </div>

              <div className="flex flex-col shadow py-[15px] px-[25px]">
                <div className="flex mb-6 items-center">
                  <Image
                    src="/images/service4.png"
                    sizes="100vw"
                    className="h-auto w-[50px] object-contain mr-4"
                    width={0}
                    height={0}
                    alt="real"
                  />
                  <div className="text-[var(--primaryTextColor)] text-[20px] font-bold hover:text-[var(--customColor)]">
                    Smart Farm Housing
                  </div>
                </div>
                <div className="text-[var(--secondaryTextColor)]">
                  Automated climate-controlled environments that optimize temperature and ventilation for maximum bird comfort and growth.
                </div>
              </div>
              <div className="flex flex-col shadow py-[15px] px-[25px]">
                <div className="flex mb-6 items-center">
                  <Image
                    src="/images/service5.png"
                    sizes="100vw"
                    className="h-auto w-[50px] object-contain mr-4"
                    width={0}
                    height={0}
                    alt="real"
                  />
                  <div className="text-[var(--primaryTextColor)] text-[20px] font-bold hover:text-[var(--customColor)]">
                    Organic Waste Solutions
                  </div>
                </div>
                <div className="text-[var(--secondaryTextColor)]">
                  Transforming poultry by-products into eco-friendly organic fertilizers to support sustainable crop production.
                </div>
              </div>
              <div className="flex flex-col shadow py-[15px] px-[25px]">
                <div className="flex mb-6 items-center">
                  <Image
                    src="/images/service6.png"
                    sizes="100vw"
                    className="h-auto w-[50px] object-contain mr-4"
                    width={0}
                    height={0}
                    alt="real"
                  />
                  <div className="text-[var(--primaryTextColor)] text-[20px] font-bold hover:text-[var(--customColor)]">
                    Bio-Security & Hygiene
                  </div>
                </div>
                <div className="text-[var(--secondaryTextColor)]">
                  Advanced sanitation and air filtration systems designed to prevent disease outbreaks and maintain a sterile farm ecosystem.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ///////GALLERY SECTION//////////// */}
      <div className="flex justify-center py-[90px] bg-[var(--secondaryCustomColor)]">
        <div className="flex flex-col items-center">
          <div className="flex flex-col text-center max-w-[450px] mb-[70px]">
            <div className="text-[30px] text-[var(--primaryTextColor)] mb-2 font-bold">
              Poultry Farm Gallery
            </div>
            <div className="text-[16px] text-[var(--secondaryTextColor)]  px-2">
              Explore vibrant snapshots of our thriving poultry farm, showcasing
              healthy flocks and sustainable farming practices.
            </div>
          </div>
          <div className="grid md:grid-cols-4 grid-cols-2 w-full md:gap-7 gap-4 mb-9 md:px-0 px-[12px]">
            {gallery.slice(0, 8).map((item, index) => (
              <div key={index} className="md:h-[400px] h-[200px]">
                <Image
                  src={String(item.picture)}
                  sizes="100vw"
                  className="h-full w-full object-cover"
                  width={0}
                  height={0}
                  alt="real"
                />
              </div>
            ))}
          </div>
          <Link
            className="text-[20px] text-white bg-[var(--customColor)] rounded py-[10px] px-[30px]"
            href={'/'}
          >
            LOAD GALLERY
          </Link>
        </div>
      </div>

      {/* /////// STAFF SECTION //////////// */}
      <div className="flex justify-center py-[90px] bg-[var(--backgroundColor)]">
        <div className="customContainer">
          <div className="flex flex-col items-center">
            <div className="flex flex-col text-center max-w-[450px] mb-10">
              <div className="text-[30px] text-[var(--primaryTextColor)] mb-2 font-bold">
                Our Team Member
              </div>
              <div className="text-[16px] text-[var(--secondaryTextColor)]">
                Meet the people who are driven by care and passion in making
                SBG Egg Farm freshness a daily reality.
              </div>
            </div>
            <div className="grid md:grid-cols-4 w-full gap-7">
              {users.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="h-[250px] w-full mb-4">
                    {item.picture && <Image
                      src={String(item.picture)}
                      sizes="100vw"
                      className="h-full w-full object-cover"
                      width={0}
                      height={0}
                      alt="real"
                    />}
                  </div>
                  <div className="flex flex-col items-center shadow w-full rounded pb-[25px]">
                    <Link
                      className="text-[var(--primaryTextColor)] text-[20px] font-bold mb-[2px] hover:text-[var(--customColor)]"
                      href={'/'}
                    >
                      {item.fullName}
                    </Link>

                    {item.staffPositions && (
                      <div className="text-[var(--secondaryTextColor)] mb-3">
                        {item.staffPositions.split(',')[0].trim()}
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-3">
                      <Link
                        className="hover:text-[var(--customColor)]"
                        href={'/'}
                      >
                        <i className="bi bi-twitter-x"></i>
                      </Link>
                      <Link
                        className="hover:text-[var(--customColor)] text-blue-700"
                        href={'/'}
                      >
                        <i className="bi bi-facebook"></i>
                      </Link>
                      <Link
                        className="hover:text-[var(--customColor)] text-green-700"
                        href={'/'}
                      >
                        <i className="bi bi-whatsapp"></i>
                      </Link>
                      <Link
                        className="hover:text-[var(--customColor)] text-red-700"
                        href={'/'}
                      >
                        <i className="bi bi-instagram"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ////TESTIMONIAL SECTION//// */}
      <div className="bg-[var(--secondaryCustomColor)]">
        {' '}
        <Testimonial />
      </div>

      {/* ////BLOG SECTION//// */}
      <div className="flex justify-center py-[90px] bg-[var(--backgroundColor)]">
        <div className="customContainer">
          <div className="flex flex-col items-center">
            <div className="flex flex-col text-center max-w-[500px]">
              <div className="text-[35px] text-[var(--primaryTextColor)] mb-2 font-bold">
                Latest Blog Post
              </div>
              <div className="text-[16px] text-[var(--secondaryTextColor)] md:mb-15 mb-10">
                Discover expert tips and insights for thriving poultry farming,
                from innovative techniques to sustainable practices.
              </div>
            </div>
            <div className="grid md:grid-cols-3 w-full gap-7">
              {blogs.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start py-7 bg-[var(--backgroundColor)]"
                >
                  <Image
                    src={String(item.picture)}
                    sizes="100vw"
                    className="h-[270px] w-full object-cover mb-5"
                    width={0}
                    height={0}
                    alt="real"
                  />
                  <Link
                    className="text-[var(--primaryTextColor)] hover:text-[var(--customColor)] mb-4 text-[20px] font-bold"
                    href={`/blog/${item._id}`}
                  >
                    {item.title}
                  </Link>

                  <div
                    className="line-clamp-3 overflow-ellipsis leading-[25px] text-[var(--secondaryTextColor)] mb-4"
                    dangerouslySetInnerHTML={{
                      __html: item.content,
                    }}
                  />
                  <Link
                    className="text-[var(--primaryTextColor)] hover:text-[var(--customColor)] font-bold"
                    href={`/blog/${item._id}`}
                  >
                    Read More
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ////PARTNER SECTION//// */}
      <div className="flex py-[90px] bg-[var(--secondaryCustomColor)] justify-center">
        <div className="customContainer">
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
              0: { slidesPerView: 2 }, // 📱 Mobile (2 slides)
              640: { slidesPerView: 3 }, // 📱 Tablets (3 slides)
              1024: { slidesPerView: 5 }, // 💻 Desktops (5 slides)
            }}
            className="w-full"
          >
            <SwiperSlide>
              <Link href="/" className="w-full">
                <Image
                  src="/images/partner1.png"
                  sizes="100vw"
                  className="h-auto w-[120px]"
                  width={0}
                  height={0}
                  alt="real"
                />
              </Link>
            </SwiperSlide>
            <SwiperSlide>
              <Link href="/" className="w-full">
                <Image
                  src="/images/partner2.png"
                  sizes="100vw"
                  className="h-auto w-[120px]"
                  width={0}
                  height={0}
                  alt="real"
                />
              </Link>
            </SwiperSlide>
            <SwiperSlide>
              <Link href="/" className="w-full">
                <Image
                  src="/images/partner3.png"
                  sizes="100vw"
                  className="h-auto w-[120px]"
                  width={0}
                  height={0}
                  alt="real"
                />
              </Link>
            </SwiperSlide>
            <SwiperSlide>
              <Link href="/" className="w-full">
                <Image
                  src="/images/partner4.png"
                  sizes="100vw"
                  className="h-auto w-[120px]"
                  width={0}
                  height={0}
                  alt="real"
                />
              </Link>
            </SwiperSlide>
            <SwiperSlide>
              <Link href="/" className="w-full">
                <Image
                  src="/images/partner5.png"
                  sizes="100vw"
                  className="h-auto w-[120px]"
                  width={0}
                  height={0}
                  alt="real"
                />
              </Link>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>

      <Qualities />
    </div>
  )
}

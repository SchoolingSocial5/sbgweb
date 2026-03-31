'use client'
import Link from 'next/link'
import Image from 'next/image'
import { PageHeader } from '@/components/Public/PageBanner'
import BlogStore from '@/src/zustand/Blog'
import { formatDate } from '@/lib/helpers'

export default function Blogs() {
  const { blogs } = BlogStore()

  return (
    <div>
      <PageHeader page="Blog" title="Be educated about poultry products." />

      <div className="flex py-[75px] justify-center bg-white">
        <div className="customContainer">
          <div className="w-full rounded-md shadow-lg py-3 mb-10">
            <form className="grid grid-cols-2 text-[var(--primaryTextColor)] md:grid-cols-4 p-5 rounded-[5px] bg-white w-full">
              <div className="flex px-[10px] border border-gray-200 outline-0 text-black rounded items-center col-span-3">
                <input
                  type="search"
                  placeholder="Search Blog Post"
                  className="flex-1 py-[10px] outline-none border-none text-black text-lg"
                />
                <i className="bi bi-search"></i>
              </div>

              <button
                type="submit"
                className="bg-[var(--customTextColor)] cursor-pointer rounded px-4 py-2 hover:bg-[var(--customTextDarkColor)]"
              >
                Search
              </button>
            </form>
          </div>
          <div className="text-[var(--secondaryTextColor)] font-bold text-[30px] mb-3">
            Lates Poultry Blogs
          </div>
          <div className="grid grid-cols-3 gap-5">
            {blogs.map((item, index) => (<div key={index} className="flex flex-col">
              <div className="text relative mb-4">

                <Image
                  src={item.picture ? String(item.picture) : '/images/page-header.jpg'}
                  sizes="100vw"
                  className="h-[250px] w-full object-cover"
                  width={0}
                  height={0}
                  alt="real"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0"></div>
              </div>

              <div className="text">
                <Link
                  href={`/blog/${item._id}`}
                  className="z-10 text-black text-[20px] mb-3 block font-bold"
                >
                  {item.title}
                </Link>
                <div className="flex items-center ">
                  <div className="text mr-1  text-[var(#C1C1C4)] text-[12px]">
                    BY
                  </div>
                  <span
                    className="  text-black text-[12px] mr-4 font-bold"
                  >
                    {item.author}
                  </span>
                  <div className="text-black flex">
                    <i className="bi bi-calendar mr-2"></i>
                    <div className="text-[var(#C1C1C4)]">{formatDate(String(item.createdAt))} </div>
                  </div>
                </div>
              </div>
            </div>))}
          </div>
        </div>
      </div>
    </div>
  )
}

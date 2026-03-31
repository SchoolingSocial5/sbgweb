'use client'
import Image from 'next/image'
import { PageHeader } from '@/components/Public/PageBanner'
import BlogStore from '@/src/zustand/Blog'
import { formatDate } from '@/lib/helpers'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function Blogs() {
  const { blogs, blogForm, getBlog } = BlogStore()
  const { id } = useParams()

  useEffect(() => {
    if (id) {
      if (blogs.length) {
        BlogStore.setState(prev => {
          return {
            blogForm: prev.blogs.find(item => item._id === id)
          }
        })
      } else {
        getBlog(`/blogs/${id}`)
      }
    }
  }, [blogs, id])

  return (
    <div>
      <PageHeader page="Blog" title={blogForm.title} />

      <div className="flex py-[75px] justify-center bg-white">
        <div className="customContainer">
          <Image
            src={blogForm.picture ? String(blogForm.picture) : '/images/page-header.jpg'}
            sizes="100vw"
            className="h-auto w-full object-contain max-w-[600px] mb-5"
            width={0}
            height={0}
            alt="real"
          />

          <div className="text mb-5">
            <div
              className="z-10 text-black text-[20px] mb-3 block font-bold"
            >
              {blogForm.title}
            </div>
            <div className="flex items-center ">
              <div className="text mr-1  text-[var(#C1C1C4)] text-[12px]">
                BY
              </div>
              <span
                className="  text-black text-[12px] mr-4 font-bold"
              >
                {blogForm.author}
              </span>
              <div className="text-black flex">
                <i className="bi bi-calendar mr-2"></i>
                <div className="text-[var(#C1C1C4)]">{formatDate(String(blogForm.createdAt))} </div>
              </div>
            </div>
          </div>

          <div
            className="leading-[25px] text-[var(--secondaryTextColor)] mb-4"
            dangerouslySetInnerHTML={{
              __html: blogForm.content,
            }}
          />
        </div>
      </div>
    </div>
  )
}

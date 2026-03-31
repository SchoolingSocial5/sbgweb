'use client'
import Image from 'next/image'

import BlogStore from '@/src/zustand/Blog'

export default function PageLoader() {
  const { blogs } = BlogStore()

  return (
    <>
      {blogs.length === 0 && (
        <div className="h-full w-full flex items-center justify-center fixed z-[100] bg-[var(--customColor)]">
          <Image
            src="/WhiteIcon.png"
            sizes="100vw"
            className="h-[100px] w-auto object-contain animate-pulse"
            width={0}
            height={0}
            alt="real"
          />
        </div>
      )}
    </>
  )
}

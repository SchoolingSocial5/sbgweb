'use client'

interface PageTitleProps {
  page: string
  title: string
}

export default function PageTitle({ page, title }: PageTitleProps) {
  return (
    <>
      <div className="flex flex-wrap items-start lg:items-center mb-2 px-3 sm:px-0 pt-3 sm:pt-0">
        <span className="text-[var(--custom)] text-base mr-2 uppercase">
          {page}
        </span>{' '}
        {title}
      </div>
    </>
  )
}

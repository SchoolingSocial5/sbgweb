'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import React from 'react'

interface LinkedPaginationProp {
  url: string
  count: number
  page_size: number
  query?: string
}

const LinkedPagination: React.FC<LinkedPaginationProp> = ({
  url,
  count,
  page_size,
  query,
}) => {
  const { page } = useParams()
  const [pages, setPages] = useState<number[]>([])

  useEffect(() => {
    const totalPages = Math.ceil(count / page_size)

    const pages = Array.from(
      { length: totalPages },
      (_, index) => index + 1
    ).filter((item) => {
      if (totalPages <= 5) return true

      if (
        item === Number(page ? page : 1) ||
        item === Number(page ? page : 1) + 1 ||
        item === Number(page ? page : 1) + 2
      )
        return true

      if (
        item === 1 ||
        item === 2 ||
        item === totalPages - 1 ||
        item === totalPages
      )
        return true

      return false
    })

    setPages(pages)
  }, [page, count])

  return (
    <div className="flex items-center">
      <div>Results {count}</div>
      {Number(page ? page : 1) > 0 && (
        <div className="flex ml-auto items-center">
          {Number(page ? page : 1) > 1 && (
            <Link
              href={`${url}/${Number(page ? page : 1) - 1}${
                query ? `?${query}` : ''
              }`}
              className="table_nav_items"
            >
              <i className="bi bi-chevron-left arrow-icon"></i>
            </Link>
          )}

          {pages.map((item, index, filteredPages) => (
            <React.Fragment key={index}>
              {index > 0 &&
                filteredPages[index] !== filteredPages[index - 1] + 1 && (
                  <div key={`dots-${index}`} className="page-dots">
                    ...
                  </div>
                )}

              <Link
                href={`${url}/${Number(item)}${query ? `?${query}` : ''}`}
                className={`table_nav_items ${
                  item === Number(page ? page : 1) ? 'active' : ''
                }`}
              >
                {item}
              </Link>
            </React.Fragment>
          ))}

          {/* Next Page Button */}
          {Number(page ? page : 1) < pages.length && (
            <Link
              href={`${url}/${Number(page ? page : 1) + 1}${
                query ? `?${query}` : ''
              }`}
              className="table_nav_items"
            >
              <i className="bi bi-chevron-right arrow-icon"></i>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default LinkedPagination

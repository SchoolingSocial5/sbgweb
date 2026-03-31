'use client'
import { PolicyStore } from '@/src/zustand/app/Policy'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const TermsMenu: React.FC = () => {
  const { terms, selectTerm } = PolicyStore()
  const pathName = usePathname()

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        const index = terms.findIndex((el) => el.name.includes(hash))
        if (index !== -1) {
          selectTerm(index)
        }
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [pathName, terms.length])
  return (
    <div className="w-1/2 sm:block hidden bg-[var(--custom-color)] p-5">
      {terms.map((item, index) => (
        <a
          href={`#${item.name}`}
          key={index}
          className={`${
            item.isChecked ? 'font-bold' : ''
          } flex items-start text-[20px] text-white cursor-pointer mb-2`}
        >
          <div className="w-5 h-5 mt-[6px] text-base flex items-center justify-center rounded-full mr-3 border border-[var(--custom-border)]">
            {index + 1}
          </div>
          {item.title}
        </a>
      ))}

      {terms.length === 0 && (
        <div className="relative flex justify-center">
          <div className="not_found_text">No Terms Found</div>
          <Image
            className="max-w-[300px]"
            alt={`no record`}
            src="/images/not-found.png"
            width={0}
            sizes="100vw"
            height={0}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      )}
    </div>
  )
}

export default TermsMenu

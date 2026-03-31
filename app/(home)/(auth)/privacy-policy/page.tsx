'use client'
import Image from 'next/image'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PolicyStore } from '@/src/zustand/app/Policy'
import CompanyStore from '@/src/zustand/app/Company'

const Privacy: React.FC = () => {
  const { policyForm, policies, selectPolicy } = PolicyStore()
  const { companyForm } = CompanyStore()
  const pathName = usePathname()

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        const index = policies.findIndex((el) => el.name.includes(hash))
        if (index !== -1) {
          selectPolicy(index)
        }
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [pathName, policies.length])

  return (
    <>
      {policyForm ? (
        <div className="flex-col items-start">
          <div className="text-[24px] text-[var(--text-secondary)] mb-2">
            {companyForm.name}: Privacy Policy
          </div>
          <div className="text-lg text-[var(--text-secondary)] mb-7">
            {policyForm.title}
          </div>

          <div className="flex overflow-y-auto sm:hidden">
            {policies.map((item, index) => (
              <a
                href={`#${item.name}`}
                key={index}
                className={`${
                  item.isChecked
                    ? 'text-[var(--custom)] border-b-[var(--custom-border)]'
                    : 'border-b-[var(--border)]'
                } mr-3 px-3 border-b items-start cursor-pointer mb-2`}
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="text-justify">
            <div
              dangerouslySetInnerHTML={{
                __html: policyForm.content,
              }}
            ></div>
          </div>
        </div>
      ) : (
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
    </>
  )
}

export default Privacy

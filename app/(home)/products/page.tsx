'use client'
import React from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/Public/PageBanner'
import Products from '@/components/Public/Products'
import { AuthStore } from '@/src/zustand/user/AuthStore'

function ProductPage() {
  const { user } = AuthStore()
  return (
    <>
      <PageHeader page="Products" title="Awiza Poultry Products" />

      <div className="flex justify-center py-[90px] bg-[var(--backgroundColor)]">
        <div className="customContainer">
          <div className="flex flex-col items-center">
            <div className="flex flex-col text-center max-w-[550px] mb-5">
              <div className="text-[30px] text-[var(--primaryTextColor)] mb-2 font-bold">
                Poultry Farm Products
              </div>
              <div className="text-[16px] text-[var(--secondaryTextColor)]">
                Delivering fresh, healthy, and ethically raised poultry products
                straight from our farm to your table.
              </div>
            </div>
            <Products />
            {!user && (
              <Link
                className="text-[20px] text-white bg-[var(--customColor)] rounded py-[10px] px-[30px]"
                href={'/sign-in'}
              >
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductPage

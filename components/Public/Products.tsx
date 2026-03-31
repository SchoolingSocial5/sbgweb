'use client'
import Image from 'next/image'
import ProductStore from '@/src/zustand/Product'
import { formatMoney } from '@/lib/helpers'

export default function Products() {
  const { products, setToCart } = ProductStore()
  return (
    <>
      <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 w-full gap-4 mb-9">
        {products.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center shadow-[0_2px_6px_rgba(0,0,0,0.1)] rounded-[15px] bg-[var(--backgroundColor)] p-3 md:p-7"
          >
            <Image
              src={String(item.picture)}
              sizes="100vw"
              className="sm:h-[200px] h-[100px] w-full object-contain mb-4"
              width={0}
              height={0}
              alt="real"
            />
            <div className="flex mb-1 md:text-[20px] text-[17px]">
              <i className="bi bi-star text-[var(--customColor)] mr-1"></i>
              <i className="bi bi-star text-[var(--customColor)]  mr-1"></i>
              <i className="bi bi-star text-[var(--customColor)]  mr-1"></i>
              <i className="bi bi-star text-[var(--customColor)]  mr-1"></i>
              <i className="bi bi-star text-[var(--customColor)]"></i>
            </div>
            <div className="text-[var(--primaryTextColor md:text-[22px]  md:font-bold mb-2 text-center">
              {item.name}
            </div>
            <div className="flex justify-center mb-3">
              <div className="text-[var(--customColor)] text-[18px] font-bold mr-3">
                ₦{formatMoney(item.price)}
              </div>
            </div>
            <div className="flex w-full justify-evenly">
              <div
                onClick={() => setToCart(item, false)}
                className="flex justify-center h-[30px] w-[35px] cursor-pointer items-center border border-gray-200 rounded-[5px]"
              >
                <i className="bi bi-dash text-[var(--primaryTextColor)]"></i>
              </div>
              <div className="text-[var(--customRedColor)] text-lg font-semibold">
                {item.cartUnits}
              </div>
              <div
                onClick={() => setToCart(item, true)}
                className="flex justify-center h-[30px] w-[35px] cursor-pointer items-center border border-gray-200 rounded-[5px]"
              >
                <i className="bi bi-plus text-[var(--primaryTextColor)]"></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

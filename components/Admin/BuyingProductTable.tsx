'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatMoney } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import ProductStore, { Product } from '@/src/zustand/Product'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import Link from 'next/link'
import { Edit } from 'lucide-react'

const BuyingProductTable: React.FC = () => {
  const {
    getBuyingProducts,
    setToBuyCart,
    createTransaction,
    updateBuyingCartUnits,
    updateBuyingProducts,
    buyingCartProducts,
    count,
    buyingProducts,
  } = ProductStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const pathname = usePathname()
  const { page } = useParams()
  const url = '/products'

  useEffect(() => {
    if (buyingCartProducts.length === 0) {
      const params = `?page_size=${page_size}&page=${
        page ? page : 1
      }&ordering=${sort}&isBuyable=${true}`
      getBuyingProducts(`${url}${params}`, setMessage)
    }
  }, [page, pathname])

  const handleSubmit = async (e: string, product: Product) => {
    if (!user) {
      setMessage('Please logout and login to continue.', false)
      return
    }

    const data = {
      product: product,
      staffName: user.fullName,
      supName: product.supName,
      supAddress: product.supAddress,
      supPhone: product.supPhone,
      picture: user.picture,
      totalAmount: product.cartUnits * product.costPrice,
      payment: e,
      remark: product.remark,
      isProfit: false,
      status: true,
    }

    createTransaction(
      `/transactions/purchase?isBuyable=false&ordering=name`,
      data,
      setMessage,
      () => {
        updateBuyingProducts()
      }
    )
  }

  return (
    <>
      <div className="card_body sharp mb-3 flex items-center flex-wrap">
        <div className="px-2 py-1 bg-[var(--secondary)] text-[var(--text-secondary)] mr-3">
          {user?.fullName}
        </div>
      </div>

      {buyingProducts.map((item, index) => (
        <div key={index} className="card_body sharp mb-1">
          <div className="">
            <div className="flex flex-wrap sm:flex-nowrap relative items-start mb-3 sm:mb-1">
              <div className="flex items-center mr-3">
                {(page ? Number(page) - 1 : 1 - 1) * page_size + index + 1}
              </div>
              <div className="relative w-[150px] h-[100px] sm:h-[50] sm:w-[100] mb-3 sm:mb-0 overflow-hidden rounded-[5px] sm:mr-3">
                {item.picture ? (
                  <Image
                    alt={`email of ${item.picture}`}
                    src={String(item.picture)}
                    width={0}
                    sizes="100vw"
                    height={0}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span>N/A</span>
                )}
              </div>
              <div className="flex flex-col items-start w-full mr-auto sm:w-auto">
                <div className="flex text-lg mb-2 sm:mb-3 items-center">
                  <div className="text-[var(--text-secondary)]">
                    {item.name}
                  </div>{' '}
                  <span className="block mx-1">|</span>
                  <div className="line-clamp-2 overflow-ellipsis">
                    {item.seoTitle}
                  </div>
                </div>
                <div className="flex mb-2">
                  <div className="flex mr-5">
                    Cost Price:{' '}
                    <span className="text-[var(--text-secondary)] ml-1">
                      ₦{formatMoney(item.costPrice)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div
                    onClick={() => setToBuyCart(item, false)}
                    className="flex justify-center h-[30px] w-[30px] cursor-pointer items-center bg-[var(--secondary)]"
                  >
                    <i className="bi bi-dash text-[var(--text-secondary)]"></i>
                  </div>
                  <input
                    value={item.cartUnits}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (isNaN(value) || value < 0) return
                      updateBuyingCartUnits(item._id, value)
                    }}
                    placeholder="Units"
                    className="bg-[var(--secondary)] mx-2 max-w-[80px] p-1 outline-none border border-[var(--border)]"
                    type="number"
                  />
                  <div
                    onClick={() => setToBuyCart(item, true)}
                    className="flex justify-center h-[30px] w-[30px] cursor-pointer items-center bg-[var(--secondary)]"
                  >
                    <i className="bi bi-plus text-[var(--customRedColor)]"></i>
                  </div>
                </div>
              </div>
              {item.cartUnits > 0 && (
                <div className="flex items-center mt-auto">
                  <div
                    onClick={() => handleSubmit('Transfer', item)}
                    className="px-2 cursor-pointer py-1 bg-[var(--success)] text-white mr-3"
                  >
                    Transfer
                  </div>
                  <div
                    onClick={() => handleSubmit('Cash', item)}
                    className="px-3 cursor-pointer py-1 bg-[var(--customRedColor)] text-white mr-3"
                  >
                    Cash
                  </div>
                  <div
                    onClick={() => handleSubmit('POS', item)}
                    className="px-3 cursor-pointer py-1 bg-[var(--customColor)] text-white mr-3"
                  >
                    POS
                  </div>
                </div>
              )}
              <Link
                className="mx-3 absolute top-[-10px] right-0"
                href={`/admin/products/edit-buy-product/${item._id}`}
              >
                <Edit className="cursor-pointer" size={18} />
              </Link>
            </div>
            {item.cartUnits > 0 && (
              <textarea
                value={item.remark}
                onChange={(e) => {
                  const remark = e.target.value
                  ProductStore.setState((prev) => ({
                    buyingProducts: prev.buyingProducts.map((p) =>
                      p._id === item._id ? { ...p, remark } : p
                    ),
                  }))
                }}
                name="remark"
                id=""
                placeholder="Purchase remark"
                className="w-full max-w-[600px] mt-3 p-1 bg-[var(--secondary)] outline-none border-none "
              ></textarea>
            )}
          </div>
        </div>
      ))}

      <div className="card_body sharp">
        <LinkedPagination
          url="/admin/activites/purchase"
          count={count}
          page_size={20}
        />
      </div>
    </>
  )
}

export default BuyingProductTable

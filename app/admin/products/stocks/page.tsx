'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatMoney } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import StockingStore from '@/src/zustand/Stocking'

const Stocks: React.FC = () => {
  const { getStocks, reshuffleResults, loading, count, stocks } =
    StockingStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { page } = useParams()
  const url = '/products'

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    const params = `?page_size=${page_size}&page=${page ? page : 1
      }&ordering=${sort}`
    getStocks(`${url}${params}`, setMessage)
  }, [page])

  return (
    <>
      <div className="overflow-auto mb-5">
        {stocks.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Picture</th>
                <th>Product</th>
                <th>Units</th>
                <th>Sales Units</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((item, index) => (
                <tr
                  key={index}
                  className={` ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                >
                  <td>
                    <div className="flex items-center">
                      {(page ? Number(page) - 1 : 1 - 1) * page_size +
                        index +
                        1}
                    </div>
                  </td>
                  <td>
                    <div className="relative w-[50px] h-[50px] overflow-hidden rounded-full">
                      <Image
                        alt={`email of ${item.picture}`}
                        src={
                          item.picture
                            ? String(item.picture)
                            : '/images/avatar.jpg'
                        }
                        width={0}
                        sizes="100vw"
                        height={0}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  </td>
                  <td>{item.name}</td>
                  <td>{formatMoney(item.units)}</td>
                  <td>
                    {Math.floor(item.units / item.unitPerPurchase)}{' '}
                    {item.purchaseUnit}{' '}
                    {(item.units % item.unitPerPurchase)}{' Pieces'}
                  </td>
                  <td>
                    <div className="flex">
                      {Math.floor(item.units / item.unitPerPurchase) >= 10 ? (
                        <div className="px-3 py-1 bg-[var(--success)] text-white">
                          Enough
                        </div>
                      ) : Math.floor(item.units / item.unitPerPurchase) >= 5 ? (
                        <div className="px-3 py-1 bg-[var(--warning)] text-white">
                          Warning
                        </div>
                      ) : Math.floor(item.units / item.unitPerPurchase) >= 1 ? (
                        <div className="px-3 py-1 bg-[var(--customRedColor)] text-white">
                          Danger
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-[var(--secondary)] text-[var(--customRedColor)]">
                          Finished
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No Stocks Found</div>
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
      {loading && (
        <div className="flex w-full justify-center py-5">
          <i className="bi bi-opencollective loading"></i>
        </div>
      )}

      <div className="card_body sharp">
        <LinkedPagination url="/admin/pages/faq" count={count} page_size={20} />
      </div>
    </>
  )
}

export default Stocks

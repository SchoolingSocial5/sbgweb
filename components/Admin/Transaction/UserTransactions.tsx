'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import StockingStore from '@/src/zustand/Stocking'
import {
  formatDateToDDMMYY,
  formatMoney,
  formatTimeTo12Hour,
} from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'
import TransactionStore from '@/src/zustand/Transaction'

const UserTransactions: React.FC = () => {
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { toggleActive } = StockingStore()
  const { summary, loading, count, userTransactions, getUserTransactions } =
    TransactionStore()
  const pathname = usePathname()
  const { page, username } = useParams()
  const defaultFrom = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }

  const defaultTo = () => {
    const d = new Date()
    d.setHours(23, 59, 59, 999)
    return d
  }
  const [fromDate, setFromDate] = useState<Date>(defaultFrom)
  const [toDate, setToDate] = useState<Date>(defaultTo)
  const url = `/transactions?dateFrom=${fromDate}&dateTo=${toDate}`

  useEffect(() => {
    if (fromDate && toDate) {
      const params = `&page_size=${page_size}&username=${username}&page=${
        page ? page : 1
      }&ordering=${sort}`
      getUserTransactions(`${url}${params}`, setMessage)
    }
  }, [page, pathname, username, toDate, fromDate])

  return (
    <>
      <StatDuration
        title={`${username} Transactions`}
        fromDate={fromDate}
        toDate={toDate}
        setFromDate={setFromDate}
        setToDate={setToDate}
      />

      <div className="overflow-auto mb-5">
        {userTransactions.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Picture</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {userTransactions.map((item, index) => (
                <tr
                  key={index}
                  className={` ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                >
                  <td>
                    <div className="flex items-center">
                      {(page ? Number(page) - 1 : 1 - 1) * page_size +
                        index +
                        1}
                      <i
                        onClick={() => toggleActive(index)}
                        className="bi bi-three-dots-vertical text-lg cursor-pointer"
                      ></i>
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
                  <td>{item.fullName}</td>
                  <td
                    className={`${
                      item.isProfit
                        ? 'text-[var(--success)]'
                        : 'text-[var(--customRedColor)]'
                    }`}
                  >
                    ₦{formatMoney(item.totalAmount)}
                  </td>
                  <td>
                    <div className="flex">
                      <div
                        className={`${
                          item.status
                            ? 'bg-[var(--success)]'
                            : 'bg-[var(--customRedColor)]'
                        } px-2 cursor-pointer py-1  text-white`}
                      >
                        {item.status ? 'Paid' : 'Pending'}
                      </div>
                    </div>
                  </td>

                  <td>
                    {formatTimeTo12Hour(item.createdAt)} <br />
                    {formatDateToDDMMYY(item.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No Transactions Found</div>
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
      <div className="card_body sharp mb-3">
        <div className="flex flex-wrap items-center">
          <div className="ml-auto flex items-center">
            <div className="text-[var(--success)] mr-3">
              ₦{formatMoney(summary.totalProfit)}
            </div>
            <div className="text-[var(--customRedColor)]">
              ₦{formatMoney(summary.totalLoss)}
            </div>
          </div>
        </div>
      </div>

      <div className="card_body sharp">
        <LinkedPagination
          url="/admin/transactions"
          count={count}
          page_size={20}
        />
      </div>
    </>
  )
}

export default UserTransactions

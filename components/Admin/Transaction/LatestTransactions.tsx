'use client'
import Image from 'next/image'
import TransactionStore from '@/src/zustand/Transaction'
import { formatMoney, formatTimeTo12Hour } from '@/lib/helpers'

export default function LatestTransactions() {
  const { latest } = TransactionStore()

  return (
    <div className="card_body flex-1 sm:mr-4 mb-2 sm:mb-0 p-4 sharp overflow-x-auto">
      <h2 className="mb-2 text-lg font-semibold">Latest Transactions</h2>

      <div className="overflow-auto mb-5">
        {latest.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--secondary)] p-2">
                <th>S/N</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {latest.slice(0, 5).map((item, index) => (
                <tr
                  key={index}
                  className={` ${
                    index % 2 === 1 ? 'bg-[var(--secondary)]' : ''
                  }`}
                >
                  <td>
                    <div className="flex items-center">{index + 1}</div>
                  </td>
                  {/* <td>
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
                  </td> */}
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

                  <td>{formatTimeTo12Hour(item.createdAt)}</td>
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
    </div>
  )
}

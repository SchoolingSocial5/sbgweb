'use client'
import Image from 'next/image'
import { formatMoney, formatTimeTo12Hour } from '@/lib/helpers'
import ExpenseStore from '@/src/zustand/Expenses'

export default function LatestExpenses() {
  const { latestExpenses } = ExpenseStore()

  return (
    <div className="card_body w-full min-w-[300px] flex-1 sm:mr-4 mb-2 sm:mb-0 p-4 sharp overflow-x-auto">
      <h2 className="mb-2 text-lg font-semibold">Latest Expenses</h2>

      <div className="overflow-auto w-full mb-5">
        {latestExpenses.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--secondary)] p-2">
                <th>S/N</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {latestExpenses.slice(0, 5).map((item, index) => (
                <tr
                  key={index}
                  className={`text-[12px] ${
                    index % 2 === 1 ? 'bg-[var(--secondary)]' : ''
                  }`}
                >
                  <td>
                    <div className="flex items-center">{index + 1}</div>
                  </td>

                  <td>
                    <div className="line-clamp-1 overflow-ellipsis">
                      {item.staffName}
                    </div>
                  </td>
                  <td className={`text-[var(--customRedColor)]`}>
                    ₦{formatMoney(item.amount)}
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

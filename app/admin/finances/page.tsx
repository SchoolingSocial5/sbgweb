'use client'
import { useState, useEffect } from 'react'
import { formatDateToDDMMYY, formatMoney, } from '@/lib/helpers'
import SummaryStore from '@/src/zustand/Summary'
import FinanceDuration from '@/components/Admin/FinanceDuration'

const PurchaseTransactions: React.FC = () => {
  const { expenses, purchases, sales, salaries, consumptions, getConsumptionSummary, getPurchaseSummary, getSalarySummary, getExpensesSummary, getSalesSummary } = SummaryStore()

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
  const [days, setDays] = useState(0)

  useEffect(() => {
    if (fromDate && toDate) {
      getExpensesSummary(`/summary/expenses?dateFrom=${fromDate}&dateTo=${toDate}`)
      getSalesSummary(`/summary/sales?dateFrom=${fromDate}&dateTo=${toDate}`)
      getPurchaseSummary(`/summary/purchases?dateFrom=${fromDate}&dateTo=${toDate}`)
      getSalarySummary(`/summary/salaries?dateFrom=${fromDate}&dateTo=${toDate}`)
      getConsumptionSummary(`/summary/consumptions?dateFrom=${fromDate}&dateTo=${toDate}`)

      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDays(diffDays)
    }
  }, [toDate, fromDate])

  return (
    <>
      <FinanceDuration
        title="Financial Summary"
        fromDate={fromDate}
        toDate={toDate}
        setFromDate={setFromDate}
        setToDate={setToDate}
      />
      <div className="overflow-auto mb-5">
        <table>
          <thead>
            <tr className="bg-[var(--primary)] p-2">
              <th>S/N</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Records</th>
              <th>Days</th>
              <th>From</th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            <tr
              className={``}
            >
              <td>
                <div className="flex items-center">
                  1
                </div>
              </td>
              <td>Sales</td>
              <td>₦{formatMoney(sales.totalAmount)}</td>
              <td>{sales.totalDocuments}</td>
              <td>{days} Days</td>
              <td>{formatDateToDDMMYY(fromDate)}</td>
              <td>{formatDateToDDMMYY(toDate)}</td>
            </tr>
            <tr
              className={`bg-[var(--primary)]`}
            >
              <td>
                <div className="flex items-center">
                  2
                </div>
              </td>
              <td>Purchases</td>
              <td>₦{formatMoney(purchases.totalAmount)}</td>
              <td>{purchases.totalDocuments}</td>
              <td>{days} Days</td>
              <td>{formatDateToDDMMYY(fromDate)}</td>
              <td>{formatDateToDDMMYY(toDate)}</td>
            </tr>
            <tr
              className={``}
            >
              <td>
                <div className="flex items-center">
                  3
                </div>
              </td>
              <td>Expenses</td>
              <td>₦{formatMoney(expenses.totalAmount)}</td>
              <td>{expenses.totalDocuments}</td>
              <td>{days} Days</td>
              <td>{formatDateToDDMMYY(fromDate)}</td>
              <td>{formatDateToDDMMYY(toDate)}</td>
            </tr>
            <tr
              className={`bg-[var(--primary)]`}
            >
              <td>
                <div className="flex items-center">
                  4
                </div>
              </td>
              <td>Salaries</td>
              <td>₦{formatMoney(salaries.totalAmount)}</td>

              <td>{salaries.totalDocuments}</td>
              <td>{days} Days</td>
              <td>{formatDateToDDMMYY(fromDate)}</td>
              <td>{formatDateToDDMMYY(toDate)}</td>
            </tr>
            <tr
              className={``}
            >
              <td>
                <div className="flex items-center">
                  5
                </div>
              </td>
              <td>Consumption</td>
              <td>₦{formatMoney(consumptions.totalAmount)}</td>

              <td>{consumptions.totalDocuments}</td>
              <td>{days} Days</td>
              <td>{formatDateToDDMMYY(fromDate)}</td>
              <td>{formatDateToDDMMYY(toDate)}</td>
            </tr>
          </tbody>
        </table>

      </div>

      <div className="card_body sharp mb-3">
        <div className="flex flex-wrap gap-3 items-center">

          <div className="ml-auto flex items-center">

          </div>
        </div>
      </div>
    </>
  )
}

export default PurchaseTransactions

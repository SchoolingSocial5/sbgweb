'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import {
  formatDateToDDMMYY,
  formatMoney,
  formatTimeTo12Hour,
} from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'
import TransactionStore from '@/src/zustand/Transaction'

const PurchaseTransactions: React.FC = () => {
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const {
    loading,
    count,
    transactions,
    isAllChecked,
    selectedTransactions,
    toggleChecked,
    toggleAllSelected,
    massDeleteTransactions,
    getTransactions,
  } = TransactionStore()
  const { page } = useParams()
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
  const [sum, setSum] = useState(0)
  const url = `/transactions?dateFrom=${fromDate}&dateTo=${toDate}`

  useEffect(() => {
    if (fromDate && toDate) {
      const params = `&page_size=${page_size}&page=${page ? page : 1
        }&ordering=${sort}&isProfit=false`
      getTransactions(`${url}${params}`, setMessage)
    }
  }, [page, toDate, fromDate])

  useEffect(() => {
    const total = transactions.reduce((sum, item) => sum + item.totalAmount, 0);
    setSum(total)
  }, [transactions])

  const startDeleteTransactions = async () => {
    if (selectedTransactions.length === 0) {
      setMessage('Please select at least one transaction to delete', false)
      return
    }

    setAlert(
      'Warning',
      'Are you sure you want to delete the selected transactions?',
      true,
      () => deleteManyTransactions()
    )
  }

  const deleteManyTransactions = async () => {
    const ids = selectedTransactions.map((item) => item._id)
    await massDeleteTransactions(
      `/transactions/mass-delete?dateFrom=${fromDate}&dateTo=${toDate}&page_size=${page_size}&page=${page ? page : 1
      }&ordering=${sort}&isProfit=true`,
      { ids: ids },
      setMessage
    )
  }

  return (
    <>
      <StatDuration
        title="Daily Purchases"
        fromDate={fromDate}
        toDate={toDate}
        setFromDate={setFromDate}
        setToDate={setToDate}
      />

      <div className="overflow-auto mb-5">
        {transactions.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>S. Name</th>
                <th>S. Phone</th>
                <th>S. Address</th>
                <th>Purchase</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Time</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item, index) => (
                <tr
                  key={index}
                  className={` ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                >
                  <td>
                    <div className="flex items-center">
                      <div
                        className={`checkbox ${item.isChecked ? 'active' : ''}`}
                        onClick={() => toggleChecked(index)}
                      >
                        {item.isChecked && (
                          <i className="bi bi-check text-white text-lg"></i>
                        )}
                      </div>
                      {(page ? Number(page) - 1 : 1 - 1) * page_size +
                        index +
                        1}
                    </div>
                  </td>
                  <td>{item.supName}</td>
                  <td>{item.supPhone}</td>
                  <td>{item.supAddress}</td>

                  <td>
                    <div className={``}>
                      <div className={`flex text-[var(--text-secondary)]`}>
                        ₦{formatMoney(item.product.costPrice)} x{' '}
                        {item.product.cartUnits} {item.product.purchaseUnit} of{' '}
                        {item.product.name}
                      </div>
                      <div className="text-sm">staff: {item.staffName}</div>
                    </div>
                  </td>
                  <td
                    className={`${item.isProfit
                      ? 'text-[var(--success)]'
                      : 'text-[var(--customRedColor)]'
                      }`}
                  >
                    ₦{formatMoney(item.totalAmount)}
                  </td>
                  <td>
                    <div className="text-[var(--success)]">{item.payment}</div>
                  </td>
                  <td>
                    {formatTimeTo12Hour(item.createdAt)} <br />
                    {formatDateToDDMMYY(item.createdAt)}
                  </td>
                  <td className="max-w-[120px]">{item.remark}</td>
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
        <div className="flex flex-wrap gap-3 items-center">
          <div onClick={toggleAllSelected} className="tableActions">
            <i
              className={`bi bi-check2-all ${isAllChecked ? 'text-[var(--customRedColor)]' : ''
                }`}
            ></i>
          </div>
          <div onClick={startDeleteTransactions} className="tableActions">
            <i className="bi bi-trash"></i>
          </div>
          <div className="ml-auto flex items-center">
            <div className="text-[var(--customRedColor)] mr-3">
              ₦{formatMoney(sum)}
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

export default PurchaseTransactions
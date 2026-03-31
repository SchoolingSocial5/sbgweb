'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import {
  formatDateToDDMMYY,
  formatMoney,
  formatTimeTo12Hour,
} from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'
import TransactionStore, { TransactionEmpty } from '@/src/zustand/Transaction'
import { AuthStore } from '@/src/zustand/user/AuthStore'

const Transactions: React.FC = () => {
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const {
    summary,
    loading,
    count,
    transactions,
    transactionForm,
    updatePartPayment,
    setTransactionForm,
    updateTransaction,
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
  const [partPayment, setPartPayment] = useState(0)
  const { user } = AuthStore()
  const url = `/transactions?dateFrom=${fromDate}&dateTo=${toDate}`

  useEffect(() => {
    if (fromDate && toDate) {
      const params = `&page_size=${page_size}&page=${
        page ? page : 1
      }&ordering=${sort}&username=${user?.username}`
      getTransactions(`${url}${params}`, setMessage)
    }
  }, [page, toDate, fromDate])

  const updateTrnx = (e: boolean, id: string) => {
    updateTransaction(
      `/transactions/${id}?ordering=-createdAt`,
      { status: e ? false : true },
      setMessage
    )
  }

  const handleSubmit = async (e: string) => {
    const form = new FormData()
    form.append('username', transactionForm.username)
    form.append('partPayment', JSON.stringify(partPayment))
    form.append('totalAmount', String(transactionForm.totalAmount))
    form.append('payment', String(e))
    updatePartPayment(
      `/transactions/part-payment/${
        transactionForm._id
      }/?ordering=${sort}&page=${
        page ? page : 1
      }&dateFrom=${fromDate}&dateTo=${toDate}`,
      form,
      setMessage,
      () => {
        setTransactionForm(TransactionEmpty)
      }
    )
  }

  return (
    <>
      <StatDuration
        title="Daily Transactions"
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
                <th>Customer</th>
                <th>Products</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
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
                      {(page ? Number(page) - 1 : 1 - 1) * page_size +
                        index +
                        1}
                    </div>
                  </td>
                  <td>
                    {item.fullName}
                    {item.staffName && (
                      <div className="text-[12px]">{item.staffName}</div>
                    )}
                  </td>
                  <td>
                    {item.cartProducts.map((p, i) => (
                      <div key={i} className="flex text-sm">
                        {p.cartUnits} {p.purchaseUnit} of {p.name}
                      </div>
                    ))}
                  </td>
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
                      {!item.status && item.partPayment ? (
                        <div
                          onClick={() => setTransactionForm(item)}
                          className={`bg-[var(--customRedColor)] px-2 cursor-pointer py-1  text-white`}
                        >
                          {item.status ? 'Paid' : 'Pending'}
                        </div>
                      ) : (
                        <div
                          onClick={() => updateTrnx(item.status, item._id)}
                          className={`${
                            item.status
                              ? 'bg-[var(--success)]'
                              : 'bg-[var(--customRedColor)]'
                          } px-2 cursor-pointer py-1  text-white`}
                        >
                          {item.status ? 'Paid' : 'Pending'}
                        </div>
                      )}
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

      {transactionForm._id && (
        <div
          onClick={() => setTransactionForm(TransactionEmpty)}
          className="fixed h-full w-full z-30 left-0 top-0 bg-black/50 items-center justify-center flex"
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="card_body sharp w-full max-w-[600px]"
          >
            <div className="overflow-auto max-h-[80vh]">
              {transactionForm.cartProducts.map((item, index) => (
                <div key={index} className="card_body sharp mb-1">
                  <div className="">
                    <div className="flex flex-wrap sm:flex-nowrap relative items-start mb-3">
                      <div className="flex items-center mr-3">{index + 1}</div>
                      <div className="relative w-[70px] h-[50px] mb-3 sm:mb-0 overflow-hidden rounded-[5px] sm:mr-3">
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
                      <div className="flex flex-col items-start w-full sm:w-auto">
                        <div className="text-[var(--text-secondary)] mb-1">
                          {item.name}
                        </div>{' '}
                        <div className="flex text-sm">
                          <div className="flex mr-3">
                            Qty:
                            <span className="text-[var(--text-secondary)] ml-1">
                              {item.cartUnits}
                            </span>
                          </div>
                          <div className="flex">
                            Price:
                            <span className="text-[var(--text-secondary)] ml-1">
                              ₦{formatMoney(item.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex mr-3">
                        Price:
                        <span className="text-[var(--text-secondary)] ml-1">
                          ₦{formatMoney(item.price * item.cartUnits)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-end mb-2">
              <div className="text-lg text-[var(--customRedColor)] mr-3">
                Part Payment
              </div>
              <div className="text-lg text-[var(--customRedColor)] mr-3">
                ₦{formatMoney(transactionForm.partPayment)}
              </div>
              <input
                value={partPayment}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (
                    isNaN(value) ||
                    value < 0 ||
                    value > transactionForm.totalAmount
                  )
                    return
                  setPartPayment(value)
                }}
                placeholder="Part payment"
                className="bg-[var(--secondary)] max-w-[150px] p-1 outline-none border border-[var(--border)]"
                type="number"
              />
            </div>

            <div className="bg-[var(--secondary)] p-3 flex items-center flex-wrap">
              <div className="mr-auto text-[var(--customRedColor)]">
                ₦{formatMoney(transactionForm.totalAmount)}
              </div>
              <div
                onClick={() => handleSubmit('Transfer')}
                className="px-2 cursor-pointer py-1 bg-[var(--success)] text-[var(--text-secondary)] mr-3"
              >
                Transfer
              </div>
              <div
                onClick={() => handleSubmit('Cash')}
                className="px-3 cursor-pointer py-1 bg-[var(--customRedColor)] text-[var(--text-secondary)] mr-3"
              >
                Cash
              </div>
              <div
                onClick={() => handleSubmit('POS')}
                className="px-3 cursor-pointer py-1 bg-[var(--customColor)] text-[var(--text-secondary)] mr-3"
              >
                POS
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Transactions

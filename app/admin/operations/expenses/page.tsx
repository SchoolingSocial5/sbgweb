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
import ExpenseStore from '@/src/zustand/Expenses'
import { AuthStore } from '@/src/zustand/user/AuthStore'

const Expenses: React.FC = () => {
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const {
    loading,
    count,
    expenses,
    expensesForm,
    createExpenses,
    setExpenseForm,
    updateExpenses,
    getExpenses,
  } = ExpenseStore()
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
  const [summary, setSummary] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [fromDate, setFromDate] = useState<Date>(defaultFrom)
  const [toDate, setToDate] = useState<Date>(defaultTo)
  const url = `/expenses?dateFrom=${fromDate}&dateTo=${toDate}`

  useEffect(() => {
    if (fromDate && toDate) {
      const params = `&page_size=${page_size}&page=${
        page ? page : 1
      }&ordering=${sort}`
      getExpenses(`${url}${params}`, setMessage)
    }
  }, [page, toDate, fromDate])

  useEffect(() => {
    const sum = expenses
      .map((item) => item.amount)
      .reduce((acc, num) => acc + num, 0)
    setSummary(sum)
  }, [expenses])

  const handleSubmit = async () => {
    if (!user) return
    const form = new FormData()
    form.append('username', expensesForm.username)
    form.append('staffName', user?.fullName)
    form.append('amount', String(expensesForm.amount))
    form.append('description', expensesForm.description)
    if (expensesForm._id) {
      updateExpenses(
        `/expenses/${expensesForm._id}/?ordering=${sort}&page=${
          page ? page : 1
        }&dateFrom=${fromDate}&dateTo=${toDate}`,
        form,
        setMessage,
        () => {
          setShowForm(false)
        }
      )
    } else {
      createExpenses(
        `/expenses/?ordering=${sort}&page=${
          page ? page : 1
        }&dateFrom=${fromDate}&dateTo=${toDate}`,
        form,
        setMessage,
        () => {
          setShowForm(false)
        }
      )
    }
  }

  const handleFileChange =
    (key: keyof typeof expensesForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setExpenseForm(key, file)
    }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setExpenseForm(name as keyof typeof expensesForm, value)
  }

  return (
    <>
      <StatDuration
        title="Daily expenses"
        fromDate={fromDate}
        toDate={toDate}
        setFromDate={setFromDate}
        setToDate={setToDate}
      />

      <div className="overflow-auto mb-5">
        {expenses.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Staff</th>
                <th>Amount</th>
                <th>Particulars</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item, index) => (
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
                  <td>{item.staffName}</td>
                  <td>₦{formatMoney(item.amount)}</td>
                  <td>{item.description}</td>

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
            <div className="not_found_text">No expenses Found</div>
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
          <div onClick={() => setShowForm(true)} className="tableActions">
            <i className="bi bi-plus-circle"></i>
          </div>
          <div className="ml-auto flex items-center">
            <div className="text-[var(--success)] mr-3">
              ₦{formatMoney(summary)}
            </div>
          </div>
        </div>
      </div>

      <div className="card_body sharp">
        <LinkedPagination url="/admin/expenses" count={count} page_size={20} />
      </div>

      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          className="fixed h-full w-full z-20 left-0 top-0 bg-black/50 items-center justify-center flex"
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="card_body sharp w-full max-w-[600px]"
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Amount
                </label>
                <input
                  className="form-input"
                  name="amount"
                  value={expensesForm.amount}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Staff
                </label>
                <div className="form-input">{user?.fullName}</div>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Particulars
              </label>
              <textarea
                placeholder="Enter expense description"
                className="form-input"
                name="description"
                value={expensesForm.description}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="table-action mt-3 flex flex-wrap">
              {loading ? (
                <button className="custom_btn">
                  <i className="bi bi-opencollective loading"></i>
                  Processing...
                </button>
              ) : (
                <>
                  <label htmlFor="receipt" className="custom_btn mr-3">
                    <input
                      className="input-file"
                      type="file"
                      name="receipt"
                      id="receipt"
                      accept="image/*"
                      onChange={() => handleFileChange('receipt')}
                    />
                    <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                    Receipt
                  </label>

                  <button
                    className="custom_btn mr-3"
                    onClick={() => handleSubmit()}
                  >
                    Added
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Expenses

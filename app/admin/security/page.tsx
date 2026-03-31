'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import {
  appendForm,
  formatDateToDDMMYY,
  formatTimeTo12Hour,
} from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { validateInputs } from '@/lib/validation'
import VisitorStore from '@/src/zustand/Visitor'
import { User, UserStore } from '@/src/zustand/user/User'
import _debounce from 'lodash/debounce'

const Visitors: React.FC = () => {
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const { setAlert } = AlartStore()
  const {
    loading,
    count,
    isAllChecked,
    visitors,
    visitorForm,
    selectedVisitors,
    toggleChecked,
    toggleAllSelected,
    setForm,
    getVisitors,
    updateVisitor,
    postVisitor,
    massDelete,
  } = VisitorStore()
  const { page } = useParams()
  const pathname = usePathname()
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { searchedUsers, searchUser } = UserStore()

  const [showForm, setShowForm] = useState(false)
  useEffect(() => {
    const url = `/visitors${
      fromDate && toDate
        ? `?dateFrom=${fromDate.toISOString()}&dateTo=${toDate.toISOString()}&`
        : '?'
    }page_size=${page_size}&page=${page ? page : 1}&ordering=${sort}`

    getVisitors(`${url}`, setMessage)
  }, [page, pathname, fromDate, toDate])

  const updateTrnx = (id: string) => {
    updateVisitor(
      `/visitors/${id}${
        fromDate && toDate
          ? `?dateFrom=${fromDate.toISOString()}&dateTo=${toDate.toISOString()}&ordering=-createdAt`
          : '?ordering=-createdAt'
      }`,
      { returnedAt: new Date() },
      setMessage
    )
  }

  const startDeleteVisitors = async () => {
    if (selectedVisitors.length === 0) {
      setMessage('Please select at least one item to delete', false)
      return
    }

    setAlert(
      'Warning',
      'Are you sure you want to delete the selected items?',
      true,
      () => deleteManyVisitors()
    )
  }

  const deleteManyVisitors = async () => {
    const ids = selectedVisitors.map((item) => item._id)
    await massDelete(
      `/Visitors/mass-delete?dateFrom=${fromDate}&dateTo=${toDate}&page_size=${page_size}&page=${
        page ? page : 1
      }&ordering=${sort}&isProfit=true`,
      { ids: ids },
      setMessage
    )
  }

  const searchCustomers = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value.trim().length > 0) {
        searchUser(
          `/users/search?fullName=${value}&username=${value}&email=${value}&phone=${value}&page_size=${page_size}`
        )
      } else {
        UserStore.setState({ searchedUsers: [] })
      }
    },
    1000
  )

  const selectUser = (user: User) => {
    setForm('visited', user.fullName)
    setForm('staffUsername', user.username)
    UserStore.setState({ searchedUsers: [] })
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof visitorForm, value)
  }

  const handleSubmit = async () => {
    if (!user) {
      setMessage('Please login to continue', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'recordedBy',
        value: user?.fullName,
        rules: { blank: true },
        field: 'Recorded field',
      },
      {
        name: 'name',
        value: visitorForm.name,
        rules: { blank: false },
        field: 'Name field',
      },
      {
        name: 'phone',
        value: visitorForm.phone,
        rules: { blank: false },
        field: 'Phone field',
      },
      {
        name: 'purpose',
        value: visitorForm.purpose,
        rules: { blank: false },
        field: 'Purpose field',
      },
      {
        name: 'visited',
        value: visitorForm.visited,
        rules: { blank: false },
        field: 'Authors field',
      },
      {
        name: 'remark',
        value: visitorForm.remark,
        rules: { blank: false },
        field: 'Remark field',
      },
    ]
    const { messages } = validateInputs(inputsToValidate)
    const getFirstNonEmptyMessage = (
      messages: Record<string, string>
    ): string | null => {
      for (const key in messages) {
        if (messages[key].trim() !== '') {
          return messages[key]
        }
      }
      return null
    }

    const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
    if (firstNonEmptyMessage) {
      setMessage(firstNonEmptyMessage, false)
      return
    }

    const data = appendForm(inputsToValidate)
    alertAndSubmit(data)
  }

  const alertAndSubmit = (data: FormData) => {
    setAlert(
      'Warning',
      'Are you sure you want to submit this record',
      true,
      () =>
        visitorForm._id
          ? updateVisitor(
              `/visitors/${visitorForm._id}/?ordering=-createdAt`,
              data,
              setMessage,
              () => {
                setShowForm(false)
              }
            )
          : postVisitor(
              `/visitors${
                fromDate && toDate
                  ? `?dateFrom=${fromDate.toISOString()}&dateTo=${toDate.toISOString()}&ordering=-createdAt`
                  : '?ordering=-createdAt'
              }`,
              data,
              setMessage,
              () => {
                setShowForm(false)
              }
            )
    )
  }

  return (
    <>
      <StatDuration
        title="Visitors Record"
        fromDate={fromDate || new Date()}
        toDate={toDate || new Date()}
        setFromDate={setFromDate}
        setToDate={setToDate}
      />

      <div className="overflow-auto mb-5">
        {visitors.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Visited</th>
                <th>Purpose</th>
                <th>Came In</th>
                <th>Left</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((item, index) => (
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
                  <td>{item.name}</td>
                  <td>{item.phone}</td>
                  <td>{item.visited}</td>
                  <td>{item.purpose}</td>
                  <td>
                    {formatTimeTo12Hour(item.createdAt)} <br />
                    {formatDateToDDMMYY(item.createdAt)}
                  </td>
                  <td>
                    {item.leftAt ? (
                      <div className="">
                        {formatTimeTo12Hour(item.leftAt)} <br />
                        {formatDateToDDMMYY(item.leftAt)}
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div
                          onClick={() => updateTrnx(item._id)}
                          className={`bg-[var(--customRedColor)] px-2 cursor-pointer py-1  text-white`}
                        >
                          Pending
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="max-w-[100px]">{item.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No Record Found</div>
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
              className={`bi bi-check2-all ${
                isAllChecked ? 'text-[var(--customRedColor)]' : ''
              }`}
            ></i>
          </div>

          <div onClick={startDeleteVisitors} className="tableActions">
            <i className="bi bi-trash"></i>
          </div>
          <div onClick={() => setShowForm(true)} className="tableActions">
            <i className="bi bi-plus-circle"></i>
          </div>
        </div>
      </div>

      <div className="card_body sharp">
        <LinkedPagination
          url="/admin/users/Visitors"
          count={count}
          page_size={20}
        />
      </div>

      {showForm && (
        <div
          onClick={() => {
            setShowForm(false)
          }}
          className="fixed h-full w-full pt-16 z-30 left-0 top-0 bg-black/50 items-center justify-center flex"
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="card_body sharp w-full max-w-[600px]"
          >
            <div className="relative mb-2">
              <div className="t mb-2">Staff visited: {visitorForm.visited}</div>
              <div className={`input_wrap ml-auto active `}>
                <input
                  ref={inputRef}
                  type="search"
                  onChange={searchCustomers}
                  className={`transparent-input flex-1 `}
                  placeholder="Search staff visited"
                />
                {loading ? (
                  <i className="bi bi-opencollective common-icon loading"></i>
                ) : (
                  <i className="bi bi-search common-icon cursor-pointer"></i>
                )}
              </div>

              {searchedUsers.length > 0 && (
                <div
                  className={`dropdownList ${
                    searchedUsers.length > 0
                      ? 'overflow-auto'
                      : 'overflow-hidden h-0'
                  }`}
                >
                  {searchedUsers.map((item, index) => (
                    <div
                      onClick={() => selectUser(item)}
                      key={index}
                      className="input_drop_list"
                    >
                      <div className="flex-1 cursor-pointer">
                        {item.fullName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Visitors Name
                </label>
                <input
                  className="form-input"
                  name="name"
                  value={visitorForm.name}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter visitor's name"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  {"Visitor's Phone"}
                </label>
                <input
                  className="form-input"
                  name="phone"
                  value={visitorForm.phone}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter phone"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Purpose
                </label>
                <input
                  className="form-input"
                  name="purpose"
                  value={visitorForm.purpose}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Visitor's purpose"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Recorded By
                </label>
                <div className="form-input">{user?.fullName}</div>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="label mb-2" htmlFor="">
                Remark
              </label>
              <textarea
                placeholder="Write remark"
                className="form-input"
                name="remark"
                value={visitorForm.remark}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="bg-[var(--secondary)] p-3 flex items-center flex-wrap">
              <div
                onClick={handleSubmit}
                className="px-2 cursor-pointer py-1 bg-[var(--success)] text-white mr-3"
              >
                Submit Record
              </div>{' '}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Visitors

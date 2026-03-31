'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'
import ActivityStore from '@/src/zustand/Activity'

const Transactions: React.FC = () => {
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const {
    loading,
    count,
    activities,
    isAllChecked,
    selectedActivities,
    toggleChecked,
    toggleAllSelected,
    massDelete,
    getActivities,
  } = ActivityStore()
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
  const url = `/visitors/activities?dateFrom=${fromDate}&dateTo=${toDate}`

  useEffect(() => {
    if (fromDate && toDate) {
      const params = `&page_size=${page_size}&page=${
        page ? page : 1
      }&ordering=${sort}`
      getActivities(`${url}${params}`, setMessage)
    }
  }, [page, toDate, fromDate])

  const startDeleteActivities = async () => {
    if (selectedActivities.length === 0) {
      setMessage('Please select at least one activity to delete', false)
      return
    }

    setAlert(
      'Warning',
      'Are you sure you want to delete the selected activities?',
      true,
      () => deleteManyactivities()
    )
  }

  const deleteManyactivities = async () => {
    const ids = selectedActivities.map((item) => item._id)
    await massDelete(
      `/visitors/activities/mass-delete?dateFrom=${fromDate}&dateTo=${toDate}&page_size=${page_size}&page=${
        page ? page : 1
      }&ordering=${sort}&isProfit=true`,
      { ids: ids },
      setMessage
    )
  }

  return (
    <>
      <StatDuration
        title="Daily Activities"
        fromDate={fromDate}
        toDate={toDate}
        setFromDate={setFromDate}
        setToDate={setToDate}
      />

      <div className="overflow-auto mb-5">
        {activities.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Name</th>
                <th>Username</th>
                <th>Page</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((item, index) => (
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
                  <td>{item.staffName} </td>
                  <td>{item.staffUsername}</td>
                  <td>{item.page}</td>

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
            <div className="not_found_text">No Activities Found</div>
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

          <div onClick={startDeleteActivities} className="tableActions">
            <i className="bi bi-trash"></i>
          </div>
        </div>
      </div>

      <div className="card_body sharp">
        <LinkedPagination
          url="/admin/activities"
          count={count}
          page_size={20}
        />
      </div>
    </>
  )
}

export default Transactions

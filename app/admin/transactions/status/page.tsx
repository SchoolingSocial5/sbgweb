'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import { formatTimeTo12Hour } from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'
import TransactionStore from '@/src/zustand/Transaction'

const Deliveries: React.FC = () => {
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { loading, count, deliveries, updateDelivery, getDeliveries } =
    TransactionStore()
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
  const [startingLocation, setStartingLocation] = useState('Office')
  const url = `/transactions?dateFrom=${fromDate}&dateTo=${toDate}`

  useEffect(() => {
    if (fromDate && toDate) {
      const params = `&page_size=${page_size}&page=${
        page ? page : 1
      }&ordering=${sort}&isProfit=true`
      getDeliveries(`${url}${params}`, setMessage)
    }
  }, [page, toDate, fromDate])

  const startDelivery = (id: string, status: boolean) => {
    if (status) {
      updateDelivery(
        `/transactions/${id}?dateFrom=${fromDate}&dateTo=${toDate}&page_size=${page_size}&page=${
          page ? page : 1
        }&ordering=${sort}&isProfit=true`,
        { startedAt: new Date(), startingLocation },
        setMessage
      )
    } else {
      updateDelivery(
        `/transactions/${id}?dateFrom=${fromDate}&dateTo=${toDate}&page_size=${page_size}&page=${
          page ? page : 1
        }&ordering=${sort}&isProfit=true`,
        { endedAt: new Date() },
        setMessage
      )
    }
  }

  return (
    <>
      <StatDuration
        title="Daily Delivery"
        fromDate={fromDate}
        toDate={toDate}
        setFromDate={setFromDate}
        setToDate={setToDate}
      />

      <div className="overflow-auto mb-5">
        {deliveries.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Customer</th>
                <th>Staff</th>
                <th>From</th>
                <th>Delivery</th>
                <th>Guide</th>
                <th>Fuel</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((item, index) => (
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
                    <br />
                    {item.phone}
                    <br />
                    {item.address}
                  </td>
                  <td>
                    {item.staffName}
                    <div className="cursor-pointer text-[var(--customRedColor)]">
                      {item.invoiceNumber}
                    </div>
                  </td>
                  <td>
                    {item.startingLocation ? (
                      item.startingLocation
                    ) : (
                      <input
                        value={startingLocation}
                        onChange={(e) => setStartingLocation(e.target.value)}
                        placeholder={`Office`}
                        className="bg-[var(--secondary)] ml-2 max-w-[100px] p-1 outline-none border border-[var(--border)]"
                        type="text"
                      />
                    )}
                  </td>
                  <td>
                    {formatTimeTo12Hour(item.startedAt)} <br />
                    {formatTimeTo12Hour(item.endedAt)}
                  </td>
                  <td>{item.guide}</td>
                  <td>{item.fuel}</td>
                  <td>
                    <div className="flex">
                      {!item.startedAt ? (
                        <div
                          onClick={() => startDelivery(item._id, true)}
                          className={`bg-[var(--success)] px-2 cursor-pointer py-1  text-white`}
                        >
                          Start
                        </div>
                      ) : item.startedAt && !item.endedAt ? (
                        <div
                          onClick={() => startDelivery(item._id, false)}
                          className={`bg-[var(--customRedColor)] px-2 cursor-pointer py-1  text-white`}
                        >
                          Stop
                        </div>
                      ) : (
                        <div
                          className={`bg-[var(--success)] px-2 py-1  text-white`}
                        >
                          Delivered
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

      <div className="card_body sharp">
        <LinkedPagination
          url="/admin/transactions/status"
          count={count}
          page_size={20}
        />
      </div>
    </>
  )
}

export default Deliveries

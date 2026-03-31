'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import { formatDate } from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'
import StrategyStore, { Strategy } from '@/src/zustand/Strategy'
import StrategyForm from '@/components/Admin/PopUps/StrategyForm'

const Strategies: React.FC = () => {
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const {
    loading,
    count,
    strategies,
    isAllChecked,
    showStrategyForm,
    setShowStrategyForm,
    deleteItem,
    getStrategies,
    toggleActive,
    toggleAllSelected,
  } = StrategyStore()
  const pathname = usePathname()
  const { page, username } = useParams()
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const params = `?page_size=${page_size}&page=${page ? page : 1}&ordering=${sort}`

  useEffect(() => {
    const url = `/strategies${fromDate && toDate
      ? `?dateFrom=${fromDate.toISOString()}&dateTo=${toDate.toISOString()}&`
      : '?'
      }page_size=${page_size}&page=${page ? page : 1}&ordering=${sort}`

    getStrategies(`${url}`, setMessage)
  }, [page, pathname, username, fromDate, toDate])

  const startEdit = (strategy: Strategy) => {
    StrategyStore.setState({ strategyForm: strategy })
    setShowStrategyForm(true)
  }

  const startDelete = (id: string) => {
    setAlert(
      'Warning',
      'Are you sure you want to delete this strategy record?',
      true,
      () => deleteItem(`/strategies/${id}${params}`, setMessage)
    )
  }

  return (
    <>
      <StatDuration
        title={`Strategy Reports`}
        fromDate={fromDate || new Date()}
        toDate={toDate || new Date()}
        setFromDate={setFromDate}
        setToDate={setToDate}
      />

      <div className="overflow-auto mb-5">
        {strategies.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Authority</th>
                <th>Strategies</th>
                <th>Remark</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {strategies.map((item, index) => (
                <tr
                  key={index}
                  className={` ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                >
                  <td className="relative">
                    <div className="flex items-center">
                      {(page ? Number(page) - 1 : 1 - 1) * page_size +
                        index +
                        1}
                      <i
                        onClick={() => toggleActive(index)}
                        className="bi bi-three-dots-vertical text-lg cursor-pointer"
                      ></i>
                    </div>
                    {item.isActive && (
                      <div className="card_list">
                        <span
                          onClick={() => toggleActive(index)}
                          className="more_close "
                        >
                          X
                        </span>
                        <div
                          className="card_list_item"
                          onClick={() => startEdit(item)}
                        >
                          Edit Report
                        </div>
                        <div
                          className="card_list_item"
                          onClick={() => startDelete(item._id)}
                        >
                          Delete Report
                        </div>
                      </div>
                    )}
                  </td>
                  <td>Management</td>
                  <td>
                    {item.strategies.map((s, i) => (
                      <div key={i}>{s}</div>
                    ))}
                  </td>
                  <td>{item.remark}</td>
                  <td>{formatDate(String(item.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No Monthly Strategies Found</div>
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
          <div className="grid mr-auto grid-cols-4 gap-2 w-[160px]">
            <div onClick={toggleAllSelected} className="tableActions">
              <i
                className={`bi bi-check2-all ${isAllChecked ? 'text-[var(--custom)]' : ''
                  }`}
              ></i>
            </div>
            <div
              onClick={() => setShowStrategyForm(!showStrategyForm)}
              className="tableActions"
            >
              <i className="bi bi-plus-circle"></i>
            </div>
          </div>
        </div>
      </div>
      <div className="card_body sharp">
        <LinkedPagination
          url="/admin/socials/strategies"
          count={count}
          page_size={20}
        />
      </div>
      {showStrategyForm && <StrategyForm />}
    </>
  )
}

export default Strategies

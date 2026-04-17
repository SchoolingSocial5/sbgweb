'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import { formatDateToDDMMYY, formatMoney } from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'
import ConsumptionForm from '@/components/Admin/PopUps/ConsumptionForm'
import ConsumptionStore, { Consumption } from '@/src/zustand/Consumption'
import PenStore from '@/src/zustand/Pen'

const Consumptions: React.FC = () => {
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const {
    loading,
    count,
    consumptions,
    isAllChecked,
    showConsumptionForm,
    setShowConsumptionForm,
    deleteItem,
    getConsumptions,
    toggleActive,
    toggleAllSelected,
  } = ConsumptionStore()
  const { pens, getPens } = PenStore()
  const pathname = usePathname()
  const { page } = useParams()

  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [activePen, setActivePen] = useState<string>('')

  useEffect(() => {
    getPens('/pens', setMessage)
  }, [])

  useEffect(() => {
    // if (consumptions.length === 0) {
    const params = `/consumptions${fromDate && toDate
      ? `?dateFrom=${fromDate.toISOString()}&dateTo=${toDate.toISOString()}&`
      : '?'
      }page_size=${page_size}&page=${page ? page : 1}&ordering=${sort}${activeCategory ? `&type=${activeCategory}` : ''}${activePen ? `&pen=${activePen}` : ''}`
    getConsumptions(`${params}`, setMessage)
    // }
  }, [page, pathname, toDate, fromDate, activeCategory, activePen, sort])

  const startEdit = (consumption: Consumption) => {
    ConsumptionStore.setState({ consumptionForm: consumption })
    setShowConsumptionForm(true)
  }

  const startDelete = (id: string) => {
    setAlert(
      'Warning',
      'Are you sure you want to delete this Service?',
      true,
      () => deleteItem(`/consumptions/${id}`, setMessage)
    )
  }

  const handleExport = () => {
    if (consumptions.length === 0) {
      setMessage('No records to export.', false)
      return
    }

    const headers = [
      'Date', 
      'Livestock Class', 
      'Age', 
      'Number of Birds', 
      'Consumption Qty', 
      'Total Amount (NGN)', 
      'Consumed Item', 
      'Pen House', 
      'Weight', 
      'Remarks'
    ]

    const csvContent = [
      headers.join(','),
      ...consumptions.map(item => {
        return [
          `"${formatDateToDDMMYY(item.createdAt)}"`,
          `"${item.birdClass || ''}"`,
          `"${item.birdAge || ''}"`,
          `"${item.birds || 0}"`,
          `"${item.consumption} ${item.consumptionUnit || ''}"`,
          `"${item.amount || 0}"`,
          `"${item.feed || ''}"`,
          `"${item.pen || ''}"`,
          `"${item.weight || ''}"`,
          `"${(item.remark || '').replace(/"/g, '""')}"`
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Consumptions_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setMessage('Consumption records exported successfully!', true)
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <StatDuration
          title={`Daily Consumptions`}
          fromDate={fromDate || new Date()}
          toDate={toDate || new Date()}
          setFromDate={setFromDate}
          setToDate={setToDate}
        />

        <div className="flex gap-3">
          <button
            onClick={() => setShowConsumptionForm(!showConsumptionForm)}
            className="tableActions !w-[45px] !h-[45px] flex items-center justify-center bg-[var(--customColor)] text-white border-none rounded-full shadow-md transition-all hover:scale-105 active:scale-95"
            title="Add New Consumption"
          >
            <i className="bi bi-plus-circle text-xl"></i>
          </button>
          <button
            onClick={handleExport}
            className="tableActions !w-[45px] !h-[45px] flex items-center justify-center bg-green-600 text-white border-none rounded-full shadow-md transition-all hover:scale-105 active:scale-95"
            title="Export to Excel"
          >
            <i className="bi bi-file-earmark-excel text-xl"></i>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-4 card_body sharp">
        {/* Category Filter */}
        <div className="flex flex-1 gap-2 min-w-[300px]">
          {['All', 'Feed', 'Medicine', 'Water'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat === 'All' ? '' : cat)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all border ${ (cat === 'All' && activeCategory === '') || activeCategory === cat ? 'bg-[var(--customColor)] text-white border-[var(--customColor)] shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pen Filter */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <span className="text-[10px] font-bold opacity-60 uppercase whitespace-nowrap">Filter by Pen:</span>
          <select
            value={activePen}
            onChange={(e) => setActivePen(e.target.value)}
            className="flex-1 py-1 px-3 text-[11px] font-medium bg-white border border-gray-200 rounded outline-none focus:border-[var(--customColor)] transition-all cursor-pointer shadow-sm"
          >
            <option value="">All Pens / Houses</option>
            {pens.map(pen => (
              <option key={pen._id} value={pen.name}>{pen.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-auto mb-5">
        {consumptions.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Class</th>
                <th>Age</th>
                <th>Birds</th>
                <th>Consumption</th>
                {/* <th>Unit</th> */}
                <th>Amount</th>
                <th>Consumed</th>
                <th>Pen</th>
                <th>Weight</th>
                <th>Date</th>
                <th>Remark</th>
              </tr>
            </thead>

            <tbody>
              {consumptions.map((item: any, index: number) => {
                return (
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
                            Edit consumptions
                          </div>
                          <div
                            className="card_list_item"
                            onClick={() => startDelete(item._id)}
                          >
                            Delete consumptions
                          </div>
                        </div>
                      )}
                    </td>
                    <td>{item.birdClass}</td>
                    <td>{item.birdAge}</td>
                    <td>{item.birds}</td>
                    <td>
                      {item.consumption} {item.consumptionUnit}
                    </td>
                    {/* <td>₦{formatMoney(item.unitPrice)}</td> */}
                    <td>₦{formatMoney(item.amount)}</td>
                    <td>{item.feed}</td>
                    <td>{item.pen || "N/A"}</td>
                    <td>{item.weight}</td>
                    <td>{formatDateToDDMMYY(item.createdAt)}</td>
                    <td>{item.remark}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No consumptions Found</div>
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
          url="/admin/operations/consumptions"
          count={count}
          page_size={20}
        />
      </div>
      {showConsumptionForm && <ConsumptionForm />}
    </>
  )
}

export default Consumptions
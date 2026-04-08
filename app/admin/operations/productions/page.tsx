'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import OperationStore, { Operation } from '@/src/zustand/Operation'
import {
  formatDateToDDMMYY,
  formatTimeTo12Hour,
} from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'
import ProductionForm from '@/components/Admin/PopUps/ProductionForm'
import PerformanceSummary from '@/components/Admin/PopUps/PerformanceSummary'

const DailyProductions: React.FC = () => {
  const [page_size] = useState(20)
  const [showSummary, setShowSummary] = useState(false)
  const { setMessage } = MessageStore()
  const {
    operations,
    loading,
    count,
    showOperationForm,
    setShowOperationForm,
    deleteItem,
    getOperations,
    toggleActive,
    setCurrentFilter
  } = OperationStore()
  const { page } = useParams()
  const { setAlert } = AlartStore()

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

  useEffect(() => {
    const params = `operation=Production&dateFrom=${fromDate.toISOString()}&dateTo=${toDate.toISOString()}&page_size=${page_size}&page=${page ? page : 1}&ordering=-createdAt`
    setCurrentFilter(params)
    getOperations(`/operations?${params}`, setMessage)
  }, [page, toDate, fromDate, setCurrentFilter])

  const startDelete = (id: string) => {
    const query = OperationStore.getState().currentFilter
    const url = `/operations/${id}?${query}`
    setAlert(
      'Warning',
      'Are you sure you want to delete this Production Record?',
      true,
      () => deleteItem(url, setMessage)
    )
  }

  const startEdit = (operation: Operation) => {
    OperationStore.setState({ operationForm: operation })
    setShowOperationForm(true)
  }

  return (
    <>
      <StatDuration
        title="Daily Production Records"
        fromDate={fromDate}
        toDate={toDate}
        setFromDate={setFromDate}
        setToDate={setToDate}
      />

      <div className="flex justify-end mb-3 gap-2">
        <button
          onClick={() => {
            OperationStore.getState().resetForm()
            setShowOperationForm(true)
          }}
          className="custom_btn flex items-center bg-[var(--customColor)]"
        >
          <i className="bi bi-plus-lg mr-2"></i> Add Production
        </button>

        <button
          onClick={() => setShowSummary(true)}
          className="custom_btn flex items-center bg-[var(--customColor)]"
        >
          <i className="bi bi-list-columns-reverse mr-2"></i> Summary
        </button>
      </div>

      <div className="overflow-auto mb-5">
        {operations.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Produced Product</th>
                <th>Pen / House</th>
                <th>Staff</th>
                <th>Production Breakdown (Column: Units)</th>
                <th>Total Units</th>
                <th>Time / Date</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((item, index) => {
                const totalUnits = (item.productionData?.reduce((acc, curr) => acc + (curr.units || 0), 0) || 0) + (Number(item.quantity) || 0)
                const isManure = !item.productionData || item.productionData.length === 0
                return (
                  <tr
                    key={index}
                    className={` ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                  >
                    <td className="relative">
                      <div className="flex items-center">
                        {(page ? Number(page) - 1 : 1 - 1) * page_size + index + 1}
                        <i
                          onClick={() => toggleActive(index)}
                          className="bi bi-three-dots-vertical text-lg cursor-pointer ml-1"
                        ></i>
                      </div>
                      {item.isActive && (
                        <div className="card_list z-10">
                          <span onClick={() => toggleActive(index)} className="more_close">X</span>
                          <div className="card_list_item" onClick={() => startEdit(item)}>Edit Record</div>
                          <div className="card_list_item text-red-500" onClick={() => startDelete(item._id)}>Delete Record</div>
                        </div>
                      )}
                    </td>
                    <td className="font-bold">{item.productName || 'General Production'}</td>
                    <td className="font-bold text-[var(--customColor)]">{item.pen}</td>
                    <td>{item.staffName}</td>
                    <td>
                      {!isManure ? (
                        <div className="max-w-[280px]">
                          <table className="min-w-full border-collapse">
                            <tbody>
                              {item.productionData?.filter(prod => prod.units > 0).map((prod, pIdx) => {
                                const uPP = item.unitPerPurchase || 1
                                return (
                                  <tr key={pIdx} className="border-b border-dashed border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors">
                                    <td className="py-2 pr-3 break-words text-nowrap text-sm">{prod.name}</td>
                                    <td className="py-2 text-right text-[var(--customColor)] whitespace-nowrap">
                                      {Math.floor(prod.units / uPP)}{' '}
                                      {item.unitName}{' '}
                                      {prod.units % uPP}{' Pieces'}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-sm italic opacity-70">
                          Single product production: {item.quantity} {item.unitName}
                        </div>
                      )}
                    </td>
                    <td className="text-[var(--success)] text-lg whitespace-nowrap">
                      {!isManure ? (
                        <>
                          {Math.floor(totalUnits / (item.unitPerPurchase || 1))}{' '}
                          <span className="opacity-70 text-base">{item.unitName}{' '}</span>
                          {totalUnits % (item.unitPerPurchase || 1)}{' '}
                          <span className="opacity-70 text-base">Pieces</span>
                        </>
                      ) : (
                        <>
                          {item.quantity} <span className="opacity-70 text-base">{item.unitName}</span>
                        </>
                      )}
                    </td>
                    <td>
                      <div className="text-xs">
                        {formatTimeTo12Hour(item.createdAt)} <br />
                        {formatDateToDDMMYY(item.createdAt)}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No Production Record Found</div>
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

      <div className="card_body sharp mb-3 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => {
              const headers = ['S/N', 'Pen', 'Staff', 'Breakdown', 'Total Units', 'Time', 'Date']
              const rows = operations.map((item, index) => {
                const breakdown = item.productionData?.map(p => `${p.name}: ${p.units}`).join(' | ') || ''
                const totalUnits = item.productionData?.reduce((acc, curr) => acc + (curr.units || 0), 0) || 0
                return [
                  String(index + 1),
                  item.pen || '',
                  item.staffName,
                  breakdown,
                  String(totalUnits),
                  formatTimeTo12Hour(item.createdAt),
                  formatDateToDDMMYY(item.createdAt)
                ]
              })
              const csvContent = [headers, ...rows]
                .map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
                .join("\n")
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
              const link = document.createElement("a")
              const url = URL.createObjectURL(blob)
              link.setAttribute("href", url)
              link.setAttribute("download", `production_report_${new Date().toLocaleDateString()}.csv`)
              link.style.visibility = 'hidden'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
            className="custom_btn flex items-center bg-[var(--success)]"
          >
            <i className="bi bi-file-earmark-excel mr-2"></i> Export CSV
          </button>
        </div>

        {loading && (
          <div className="flex items-center">
            <i className="bi bi-opencollective loading mr-2"></i>
            <span>Refreshing...</span>
          </div>
        )}
      </div>

      <div className="card_body sharp">
        <LinkedPagination url="/admin/operations/productions" count={count} page_size={page_size} />
      </div>

      {showOperationForm && <ProductionForm />}
      {showSummary && <PerformanceSummary 
        onClose={() => setShowSummary(false)} 
        fromDate={fromDate.toISOString()} 
        toDate={toDate.toISOString()} 
      />}
    </>
  )
}

export default DailyProductions
'use client'
import React, { useState, useMemo } from 'react'
import { formatDateToDDMMYY, formatMoney } from '@/lib/helpers'

interface PeriodicSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  data: any[]
  period: string
  type: 'Production' | 'Consumption' | 'Transaction' | 'Mortality'
}

const PeriodicSummaryModal: React.FC<PeriodicSummaryModalProps> = ({
  isOpen,
  onClose,
  data,
  period,
  type,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getGroupKey = (date: any) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    switch (period) {
      case 'Daily':
        return `${year}-${month}-${day}`
      case 'Weekly': {
        const tempDate = new Date(d)
        const dayOfWeek = tempDate.getDay()
        const diff = tempDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Set to Monday
        tempDate.setDate(diff)
        return `Week of ${formatDateToDDMMYY(tempDate)}`
      }
      case 'Monthly': {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ]
        return `${monthNames[d.getMonth()]} ${year}`
      }
      case 'Yearly':
        return `${year}`
      default:
        return `${year}-${month}-${day}`
    }
  }

  const summarizedData = useMemo(() => {
    const summaryMap: Record<string, { key: string, label: string, product: string, quantity: number, unit?: string, amount?: number }> = {}

    data.forEach((item) => {
      const dateKey = getGroupKey(item.createdAt)
      
      const processEntry = (productName: string, qty: number, amt?: number, unit?: string) => {
        const mapKey = `${dateKey}_${productName}`
        if (!summaryMap[mapKey]) {
          summaryMap[mapKey] = {
            key: dateKey,
            label: dateKey,
            product: productName,
            quantity: qty,
            amount: amt,
            unit: unit
          }
        } else {
          summaryMap[mapKey].quantity += qty
          if (amt !== undefined) {
            summaryMap[mapKey].amount = (summaryMap[mapKey].amount || 0) + amt
          }
        }
      }

      if (type === 'Production') {
        const total = (item.productionData?.reduce((acc: number, curr: any) => acc + (curr.units || 0), 0) || 0) + (Number(item.quantity) || 0)
        processEntry(item.productName || 'General Production', total, undefined, item.unitName)
      } else if (type === 'Consumption') {
        processEntry(item.feed || 'General', Number(item.consumption) || 0, Number(item.amount) || 0, item.consumptionUnit)
      } else if (type === 'Transaction') {
        if (item.cartProducts && item.cartProducts.length > 0) {
          item.cartProducts.forEach((p: any) => {
            processEntry(p.name, Number(p.cartUnits) || 0, (Number(p.price) || 0) * (Number(p.cartUnits) || 0), p.purchaseUnit)
          })
        }
      } else if (type === 'Mortality') {
        processEntry(`${item.productName} (${item.birdClass})`, Number(item.birds) || 0)
      }
    })

    // Convert to array and sort by dateKey descending
    return Object.values(summaryMap).sort((a, b) => b.key.localeCompare(a.key))
  }, [data, period, type])

  const totalPages = Math.ceil(summarizedData.length / itemsPerPage)
  const paginatedData = summarizedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[var(--primary)] flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <i className="bi bi-graph-up-arrow mr-2 text-[var(--customColor)]"></i>
            {period} {type} Summary
          </h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            <i className="bi bi-x-lg text-gray-600"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S/N</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date / Period</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {type === 'Transaction' || type === 'Consumption' ? 'Qty / Amount' : 'Quantity'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedData.length > 0 ? paginatedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{item.label}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.product}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-[var(--customColor)]">
                      {item.quantity} {item.unit}
                      {item.amount !== undefined && (
                        <div className="text-[10px] text-gray-400 font-normal">
                          ₦{formatMoney(item.amount)}
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-400 italic">
                      No records found for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Showing {Math.min(summarizedData.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(summarizedData.length, currentPage * itemsPerPage)} of {summarizedData.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1.5 rounded border text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <i className="bi bi-chevron-left mr-1"></i> Prev
                </button>
                <div className="flex items-center px-2 text-sm font-medium text-gray-600">
                  {currentPage} / {totalPages}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1.5 rounded border text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next <i className="bi bi-chevron-right ml-1"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors shadow-sm"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  )
}

export default PeriodicSummaryModal

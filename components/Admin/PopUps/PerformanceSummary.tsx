'use client'
import React, { useEffect } from 'react'
import OperationStore from '@/src/zustand/Operation'
import PenStore from '@/src/zustand/Pen'
import { MessageStore } from '@/src/zustand/notification/Message'
import { formatDateToDDMMYY } from '@/lib/helpers'

interface PerformanceSummaryProps {
    onClose: () => void
    fromDate: string
    toDate: string
}

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ onClose, fromDate, toDate }) => {
    const { performanceSummary, getPerformanceSummary, loading } = OperationStore()
    const { columns, getColumns } = PenStore()
    const { setMessage } = MessageStore()

    useEffect(() => {
        getColumns('/columns', setMessage)
        getPerformanceSummary(fromDate, toDate, setMessage)
    }, [fromDate, toDate])

    const exportToCSV = () => {
        const eggHeaders = columns.map(col => col.name)
        const headers = ['S/N', 'Date', 'Pen/House', 'Staff', ...eggHeaders, 'Total Crates', 'Manure', 'Empty Bags']
        
        const rows = performanceSummary.map((item, index) => {
            const eggValues = columns.map(col => item.eggBreakdown[col._id] || 0)
            const totalCrates = (item.totalEggUnits / 30).toFixed(1)
            
            return [
                index + 1,
                item.date,
                item.pen,
                item.staffName,
                ...eggValues,
                totalCrates,
                item.totalManure,
                item.emptyBags
            ]
        })

        const csvContent = [headers, ...rows]
            .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
            .join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `performance_summary_${fromDate}_to_${toDate}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div
            onClick={onClose}
            className="fixed h-full w-full z-50 left-0 top-0 bg-black/50 items-center justify-center flex p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="card_body sharp w-full max-w-[1200px] max-h-[90vh] overflow-auto bg-white"
            >
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="custom_sm_title text-[var(--customRedColor)]">
                        Daily Performance Summary ({formatDateToDDMMYY(fromDate)} - {formatDateToDDMMYY(toDate)})
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportToCSV} className="custom_btn bg-green-600 text-white flex items-center">
                            <i className="bi bi-file-earmark-excel mr-1"></i> Export
                        </button>
                        <button onClick={onClose} className="text-2xl font-bold">&times;</button>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[var(--primary)] sticky top-0">
                            <tr>
                                <th rowSpan={2} className="p-2 border">S/N</th>
                                <th rowSpan={2} className="p-2 border">Date</th>
                                <th rowSpan={2} className="p-2 border">Pen/House</th>
                                <th rowSpan={2} className="p-2 border">Staff</th>
                                <th colSpan={columns.length} className="p-2 border text-center">Egg Produced (Units/Pieces)</th>
                                <th rowSpan={2} className="p-2 border">Total Crates</th>
                                <th rowSpan={2} className="p-2 border">Manure (Bags)</th>
                                <th rowSpan={2} className="p-2 border">Empty Feed Bags</th>
                            </tr>
                            <tr>
                                {columns.map(col => (
                                    <th key={col._id} className="p-1 border text-xs">{col.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7 + columns.length} className="p-10 text-center">
                                        <i className="bi bi-opencollective loading text-2xl"></i>
                                        <div className="mt-2 text-sm opacity-60">Calculating performance summary...</div>
                                    </td>
                                </tr>
                            ) : performanceSummary.length === 0 ? (
                                <tr>
                                    <td colSpan={7 + columns.length} className="p-10 text-center italic opacity-60">
                                        No data found for this period.
                                    </td>
                                </tr>
                            ) : performanceSummary.map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 1 ? 'bg-[var(--primary)]' : ''}>
                                    <td className="p-2 border text-center">{idx + 1}</td>
                                    <td className="p-2 border whitespace-nowrap">{formatDateToDDMMYY(item.date)}</td>
                                    <td className="p-2 border font-bold text-[var(--customColor)]">{item.pen}</td>
                                    <td className="p-2 border break-words max-w-[150px]">{item.staffName}</td>
                                    {columns.map(col => (
                                        <td key={col._id} className="p-2 border text-right">
                                            {item.eggBreakdown[col._id] || '-'}
                                        </td>
                                    ))}
                                    <td className="p-2 border text-center font-bold text-[var(--success)]">
                                        {(item.totalEggUnits / 30).toFixed(1)}
                                    </td>
                                    <td className="p-2 border text-center">{item.totalManure || '-'}</td>
                                    <td className="p-2 border text-center text-red-500 font-semibold">{item.emptyBags || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-xs italic opacity-60">
                    * Total Crates calculated based on 30 pieces per crate. Empty bags are aggregated from consumption records.
                </div>
            </div>
        </div>
    )
}

export default PerformanceSummary

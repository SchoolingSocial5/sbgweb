'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import {
    formatDateToDDMMYY,
    formatTimeTo12Hour,
} from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'
import OperationOverlay from '../PopUps/OperationOverlay'
import OperationStore from '@/src/zustand/Operation'

const OperationsTable: React.FC = () => {
    const [page_size] = useState(20)
    const [sort] = useState('-createdAt')
    const { setMessage } = MessageStore()
    const {
        loading,
        count,
        operations,
        isAllChecked,
        showOperationForm,
        setShowOperationForm,
        getOperations,
        toggleAllSelected,
    } = OperationStore()
    const pathname = usePathname()
    const { page, username } = useParams()
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
    const url = `/operations?dateFrom=${fromDate}&dateTo=${toDate}`

    useEffect(() => {
        if (fromDate && toDate) {
            const params = `&page_size=${page_size}&page=${page ? page : 1
                }&ordering=${sort}`
            getOperations(`${url}${params}`, setMessage)
        }
    }, [page, pathname, username, toDate, fromDate])

    return (
        <>
            <StatDuration
                title={`Daily Operation Record`}
                fromDate={fromDate}
                toDate={toDate}
                setFromDate={setFromDate}
                setToDate={setToDate}
            />

            <div className="overflow-auto mb-5">
                {operations.length > 0 ? (
                    <table>
                        <thead>
                            <tr className="bg-[var(--primary)] p-2">
                                <th>S/N</th>
                                <th>Operation</th>
                                <th>Livestock</th>
                                <th>Age</th>
                                <th>Number</th>
                                <th>Weight</th>
                                <th>Medication</th>
                                <th>Quantity</th>
                                <th>Time</th>
                            </tr>
                        </thead>

                        <tbody>
                            {operations.map((item, index) => (
                                <tr
                                    key={index}
                                    className={` ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                                >
                                    <td className="relative">
                                        <div className="flex items-center">
                                            {(page ? Number(page) - 1 : 1 - 1) * page_size +
                                                index +
                                                1}

                                        </div>
                                    </td>
                                    <td>{item.operation}</td>
                                    <td>
                                        {item.livestock}
                                    </td>
                                    <td>{item.livestockAge}</td>
                                    <td>{item.livestockNumber}</td>
                                    <td>{item.weight}</td>
                                    <td>
                                        {item.medication}
                                    </td>
                                    <td>{item.quantity}</td>
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
                        <div className="not_found_text">No Operation Record Found</div>
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
                            onClick={() => setShowOperationForm(!showOperationForm)}
                            className="tableActions"
                        >
                            <i className="bi bi-plus-circle"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card_body sharp">
                <LinkedPagination
                    url="/admin/operations"
                    count={count}
                    page_size={20}
                />
            </div>
            {showOperationForm && <OperationOverlay />}
        </>
    )
}

export default OperationsTable

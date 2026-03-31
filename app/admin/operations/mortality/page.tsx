'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import StockingStore from '@/src/zustand/Stocking'
import {
    formatDateToDDMMYY,
    formatMoney,
    formatTimeTo12Hour,
} from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'

const DailyMotality: React.FC = () => {
    const [page_size] = useState(20)
    const [sort] = useState('-createdAt')
    const { setMessage } = MessageStore()
    const {
        mortalities,
        loading,
        count,
        deleteItem,
        reshuffleResults,
        toggleActive,
        getMortalities,
    } = StockingStore()
    const pathname = usePathname()
    const { page } = useParams()
    const { setAlert } = AlartStore()

    const defaultFrom = () => {
        const d = new Date()
        const day = d.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        // Calculate how many days to subtract to get back to Monday
        const diffToMonday = day === 0 ? 6 : day - 1

        const monday = new Date(d)
        monday.setDate(d.getDate() - diffToMonday)
        monday.setHours(0, 0, 0, 0)

        return monday
    }

    const defaultTo = () => {
        const d = new Date()
        const day = d.getDay()

        // Calculate how many days to add to get to Sunday
        const diffToSunday = day === 0 ? 0 : 7 - day

        const sunday = new Date(d)
        sunday.setDate(d.getDate() + diffToSunday)
        sunday.setHours(23, 59, 59, 999)

        return sunday
    }

    const [fromDate, setFromDate] = useState<Date>(defaultFrom)
    const [toDate, setToDate] = useState<Date>(defaultTo)
    const [sum, setSum] = useState(0)
    const url = `/products/stocking`
    const params = `/?dateFrom=${fromDate}&dateTo=${toDate}&page_size=${page_size}&page=${page ? page : 1
        }&ordering=${sort}&isProfit=false`

    useEffect(() => {
        reshuffleResults()
    }, [pathname])

    useEffect(() => {
        const total = mortalities.reduce((sum, item) => sum + item.amount, 0);
        setSum(total)
    }, [mortalities])

    useEffect(() => {
        getMortalities(`${url}${params}`)
    }, [page, toDate, fromDate])

    const deleteProductStock = async (id: string, index: number) => {
        toggleActive(index)
        const params = `?page_size=${page_size}&page=${page ? page : 1
            }&ordering=${sort}`
        await deleteItem(`${url}/${id}/${params}`, setMessage)
    }

    const startDelete = (id: string, index: number) => {
        setAlert(
            'Warning',
            'Are you sure you want to delete this Product Stocking?',
            true,
            () => deleteProductStock(id, index)
        )
    }

    return (
        <>
            <StatDuration
                title="Daily Mortality Records"
                fromDate={fromDate}
                toDate={toDate}
                setFromDate={setFromDate}
                setToDate={setToDate}
            />

            <div className="overflow-auto mb-5">
                {mortalities.length > 0 ? (
                    <table>
                        <thead>
                            <tr className="bg-[var(--primary)] p-2">
                                <th>S/N</th>
                                <th>Product</th>
                                <th>Staff</th>
                                <th>Quantity</th>
                                <th>Amount</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mortalities.map((item, index) => (
                                <tr
                                    key={index}
                                    className={` ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                                >
                                    <td>
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
                                                    onClick={() => startDelete(item._id, index)}
                                                >
                                                    Delete Record
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.staffName}</td>
                                    <td
                                        className={`${item.isProfit
                                            ? 'text-[var(--success)]'
                                            : 'text-[var(--customRedColor)]'
                                            }`}
                                    >
                                        {item.units}
                                    </td>
                                    <td
                                        className={`${item.isProfit
                                            ? 'text-[var(--success)]'
                                            : 'text-[var(--customRedColor)]'
                                            }`}
                                    >
                                        ₦{formatMoney(item.amount)}
                                    </td>
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
            {loading && (
                <div className="flex w-full justify-center py-5">
                    <i className="bi bi-opencollective loading"></i>
                </div>
            )}
            <div className="card_body sharp mb-3">
                <div className="flex flex-wrap items-center">
                    <div className="ml-auto flex items-center">
                        <div className="text-[var(--customRedColor)]">
                            ₦{formatMoney(sum)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card_body sharp">
                <LinkedPagination url="/admin/pages/faq" count={count} page_size={20} />
            </div>
        </>
    )
}

export default DailyMotality
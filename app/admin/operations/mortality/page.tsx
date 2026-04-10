'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import StatDuration from '@/components/Admin/StatDuration'
import MortalityForm from '@/components/Admin/PopUps/MortalityForm'
import MortalityStore, { Mortality } from '@/src/zustand/Mortality'

const DailyMortality: React.FC = () => {
    const [page_size] = useState(20)
    const [sort] = useState('-createdAt')
    const { setMessage } = MessageStore()
    const { setAlert } = AlartStore()
    const {
        mortalities,
        loading,
        count,
        showMortalityForm,
        setShowMortalityForm,
        deleteItem,
        getMortalities,
        reshuffleResults,
        toggleActive,
        resetForm,
    } = MortalityStore()
    const pathname = usePathname()
    const { page } = useParams()

    const defaultFrom = () => {
        const d = new Date()
        const day = d.getDay()
        const diffToMonday = day === 0 ? 6 : day - 1
        const monday = new Date(d)
        monday.setDate(d.getDate() - diffToMonday)
        monday.setHours(0, 0, 0, 0)
        return monday
    }

    const defaultTo = () => {
        const d = new Date()
        const day = d.getDay()
        const diffToSunday = day === 0 ? 0 : 7 - day
        const sunday = new Date(d)
        sunday.setDate(d.getDate() + diffToSunday)
        sunday.setHours(23, 59, 59, 999)
        return sunday
    }

    const [fromDate, setFromDate] = useState<Date>(defaultFrom)
    const [toDate, setToDate] = useState<Date>(defaultTo)
    const url = `/mortalities`
    const params = `?dateFrom=${fromDate}&dateTo=${toDate}&page_size=${page_size}&page=${page ? page : 1}&ordering=${sort}`

    useEffect(() => {
        reshuffleResults()
    }, [pathname])

    useEffect(() => {
        getMortalities(`${url}${params}`, setMessage)
    }, [page, toDate, fromDate])

    const startDelete = (id: string, index: number) => {
        toggleActive(index)
        setAlert(
            'Warning',
            'Are you sure you want to delete this mortality record?',
            true,
            () => deleteItem(`${url}/${id}`, setMessage)
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
                                <th>Livestock</th>
                                <th>Bird Class</th>
                                <th>Bird Age</th>
                                <th>Birds</th>
                                <th>Pen</th>
                                <th>Staff</th>
                                <th>Reason</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mortalities.map((item: any, index: number) => {
                                return (
                                    <tr
                                        key={index}
                                        className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                                    >
                                        <td>
                                            <div className="flex items-center">
                                                {(page ? Number(page) - 1 : 1 - 1) * page_size + index + 1}
                                                <i
                                                    onClick={() => toggleActive(index)}
                                                    className="bi bi-three-dots-vertical text-lg cursor-pointer ml-1"
                                                ></i>
                                            </div>
                                            {item.isActive && (
                                                <div className="card_list">
                                                    <span
                                                        onClick={() => toggleActive(index)}
                                                        className="more_close"
                                                    >
                                                        X
                                                    </span>
                                                    <div
                                                        className="card_list_item text-[var(--customRedColor)]"
                                                        onClick={() => startDelete(item._id, index)}
                                                    >
                                                        Delete Record
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td>{item.productName}</td>
                                        <td>{item.birdClass}</td>
                                        <td>{item.birdAge}</td>
                                        <td className="text-[var(--customRedColor)] font-bold">{item.birds}</td>
                                        <td>{item.pen || 'N/A'}</td>
                                        <td>{item.staffName}</td>
                                        <td>{item.reason}</td>
                                        <td>
                                            {formatTimeTo12Hour(item.createdAt)} <br />
                                            {formatDateToDDMMYY(item.createdAt)}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="relative flex justify-center">
                        <div className="not_found_text">No Mortality Records Found</div>
                        <Image
                            className="max-w-[300px]"
                            alt="no record"
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
                <div className="flex flex-wrap items-center gap-2">
                    <div className="grid mr-auto grid-cols-2 gap-2 w-[80px]">
                        <div
                            onClick={() => {
                                resetForm()
                                setShowMortalityForm(true)
                            }}
                            className="tableActions cursor-pointer"
                            title="Add Mortality Record"
                        >
                            <i className="bi bi-plus-circle"></i>
                        </div>
                    </div>
                    
                </div>
            </div>

            <div className="card_body sharp">
                <LinkedPagination url="/admin/operations/mortality" count={count} page_size={20} />
            </div>

            {showMortalityForm && <MortalityForm />}
        </>
    )
}

export default DailyMortality
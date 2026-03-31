'use client'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import ApplicationStore from '@/src/zustand/Application'
import Image from 'next/image'

const Applications: React.FC = () => {
    const [page_size] = useState(20)
    const { setMessage } = MessageStore()
    const { isAllChecked, applicants, loading, count,
        deleteItem, reshuffleResults, getApplications, toggleChecked,
        toggleAllSelected
    } = ApplicationStore()

    const pathname = usePathname()
    const { page } = useParams()
    const { setAlert } = AlartStore()
    const url = '/applications'
    const params = `?page_size=${page_size}&page=${page ? page : 1}&ordering=-createdAt`

    useEffect(() => {
        reshuffleResults()
    }, [pathname])

    useEffect(() => {
        getApplications(`${url}${params}`, setMessage)
    }, [page])

    const startDelete = (id: string, index: number) => {
        if (index) {

        }
        setAlert(
            'Warning',
            'Are you sure you want to delete this application?',
            true,
            () => deleteItem(`${url}/${id}`, setMessage)
        )
    }

    return (
        <>
            <div className="overflow-auto mb-5">
                {applicants.length > 0 ? (
                    <table>
                        <thead>
                            <tr className="bg-[var(--primary)] p-2 text-left">
                                <th className="p-3">S/N</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Username</th>
                                <th className="p-3">Position</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''} border-b border-[var(--primary)]/10`}
                                >
                                    <td className="p-3">
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
                                    <td className="p-3">{item.firstName} {item.lastName}</td>
                                    <td className="p-3">{item.username || 'N/A'}</td>
                                    <td className="p-3">{item.position || 'N/A'}</td>
                                    <td className="p-3">{item.phone}</td>
                                    <td className="p-3">{item.email}</td>
                                    <td className="p-3">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td className="p-3 text-red-500 cursor-pointer" onClick={() => startDelete(item._id, index)}>
                                        <i className="bi bi-trash"></i>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="relative flex flex-col items-center justify-center py-10">
                        <div className="not_found_text">No Applications Found</div>
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
                    <i className="bi bi-opencollective loading text-2xl"></i>
                </div>
            )}
            <div className="card_body sharp mb-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="flex flex-wrap items-center">
                    <div className="flex space-x-4">
                        <div onClick={toggleAllSelected} className="tableActions cursor-pointer hover:text-[var(--customRedColor)]">
                            <i className={`bi bi-check2-all text-xl ${isAllChecked ? 'text-[var(--customRedColor)]' : ''}`}></i>
                        </div>
                        <div onClick={() => { }} className="tableActions cursor-pointer hover:text-red-500">
                            <i className="bi bi-trash text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card_body sharp">
                <LinkedPagination url="/admin/company/applications" count={count} page_size={page_size} />
            </div>
        </>
    )
}

export default Applications

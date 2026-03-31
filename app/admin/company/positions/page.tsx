'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import PositionStore, { Position } from '@/src/zustand/app/Position'
import PositionSheet from '@/components/Admin/PopUps/PositionSheet'

const Positions: React.FC = () => {
    const [page_size] = useState(20)
    const [sort] = useState('-staffRanking')
    const { setMessage } = MessageStore()
    const { isAllChecked, positionResults, loading, count, showPosition, selectedItems,
        massDelete, reshuffleResults, getPositions, toggleChecked,
        toggleAllSelected, resetForm
    } = PositionStore()

    const pathname = usePathname()
    const { page } = useParams()
    // const { setAlert } = AlartStore()
    const url = '/company/positions'
    const params = `?page_size=${page_size}&page=${page ? page : 1
        }&ordering=${sort}&status=Staff`

    const openCreateForm = () => {
        resetForm()
        PositionStore.setState({ showPosition: true })
    }

    useEffect(() => {
        reshuffleResults()
    }, [pathname])

    useEffect(() => {
        getPositions(`${url}${params}`, setMessage)
    }, [page])

    // const deleteUserProfile = async (id: string, index: number) => {
    //     toggleActive(index)
    //     const params = `?page_size=${page_size}&page=${page ? page : 1
    //         }&ordering=${sort}`
    //     await deleteItem(`${url}/${id}/${params}`, setMessage)
    // }

    // const startDelete = (id: string, index: number) => {
    //     setAlert(
    //         'Warning',
    //         'Are you sure you want to delete this Position?',
    //         true,
    //         () => deleteUserProfile(id, index)
    //     )
    // }

    const deleteFaqs = async () => {
        if (selectedItems.length === 0) {
            setMessage('Please select at least one item to delete', false)
            return
        }
        const ids = selectedItems.map((item) => item._id)
        await massDelete(`${url}/mass-delete`, { ids: ids }, setMessage)
    }

    const startShowPosition = async (position: Position) => {
        PositionStore.setState({ showPosition: true, positionFormData: position })
    }

    return (
        <>
            <div className="overflow-auto mb-5">
                {positionResults.length > 0 ? (
                    <table>
                        <thead>
                            <tr className="bg-[var(--primary)] p-2">
                                <th>S/N</th>
                                <th>Position</th>
                                <th>Salary</th>
                                <th>Level</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positionResults.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                                >
                                    <td>
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
                                    <td
                                        onClick={() => startShowPosition(item)}
                                        className="cursor-pointer"
                                    >
                                        {item.position}
                                    </td>
                                    <td>{item.salary}</td>
                                    <td>{item.level}</td>
                                    <td>{item.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="relative flex justify-center">
                        <div className="not_found_text">No Staff Found</div>
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
                        <div onClick={deleteFaqs} className="tableActions">
                            <i className="bi bi-trash"></i>
                        </div>
                        <div onClick={openCreateForm} className="tableActions">
                            <i className="bi bi-plus-circle"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card_body sharp">
                <LinkedPagination url="/admin/company/positions" count={count} page_size={20} />
            </div>

            {showPosition && <PositionSheet />}
        </>
    )
}

export default Positions

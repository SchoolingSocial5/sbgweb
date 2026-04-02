'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import ColumnStore, { Column } from '@/src/zustand/Column'
import ColumnForm from '@/components/Admin/PopUps/ColumnForm'
import { formatDateToDDMMYY } from '@/lib/helpers'

const ColumnsPage: React.FC = () => {
    const {
        getColumns,
        deleteColumn,
        columns,
        loading,
        count,
        isForm,
        resetForm,
    } = ColumnStore()
    const { setMessage } = MessageStore()
    const { setAlert } = AlartStore()
    const { page } = useParams()
    const page_size = 20
    const sort = '-createdAt'

    useEffect(() => {
        const params = `?page_size=${page_size}&page=${page ? page : 1}&ordering=${sort}`
        getColumns(`/columns${params}`, setMessage)
    }, [page, getColumns, setMessage])

    const startDelete = (id: string) => {
        setAlert(
            'Warning',
            'Are you sure you want to delete this column?',
            true,
            () => deleteColumn(`/columns/${id}`, setMessage)
        )
    }

    const startEdit = (column: Column) => {
        ColumnStore.setState({ columnForm: column, isForm: true })
    }

    const openCreateForm = () => {
        resetForm()
        ColumnStore.setState({ isForm: true })
    }

    return (
        <>
            <div className="card_body sharp mb-5 flex justify-between items-center bg-[var(--secondary)]">
                <div className="text-xl font-bold">Production Columns Management</div>
                <button
                    onClick={openCreateForm}
                    className="custom_btn flex items-center"
                >
                    <i className="bi bi-plus-circle mr-2"></i> Add Column
                </button>
            </div>

            <div className="overflow-auto mb-5">
                {columns.length > 0 ? (
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-[var(--primary)] p-2">
                                <th>S/N</th>
                                <th>Column Name</th>
                                <th>Date Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {columns.map((item, index) => (
                                <tr
                                    key={item._id}
                                    className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                                >
                                    <td>
                                        {(page ? Number(page) - 1 : 0) * page_size + index + 1}
                                    </td>
                                    <td className="font-medium">{item.name}</td>
                                    <td>{formatDateToDDMMYY(item.createdAt)}</td>
                                    <td>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => startEdit(item)}
                                                className="text-[var(--customColor)] hover:underline flex items-center"
                                            >
                                                <i className="bi bi-pencil-square mr-1"></i> Edit
                                            </button>
                                            <button
                                                onClick={() => startDelete(item._id)}
                                                className="text-red-500 hover:underline flex items-center"
                                            >
                                                <i className="bi bi-trash mr-1"></i> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="relative flex flex-col items-center justify-center py-10">
                        <div className="not_found_text mb-4">No Columns Found</div>
                        <Image
                            className="max-w-[200px] opacity-50"
                            alt="no record"
                            src="/images/not-found.png"
                            width={200}
                            height={200}
                        />
                    </div>
                )}
            </div>

            {loading && (
                <div className="flex w-full justify-center py-5">
                    <i className="bi bi-opencollective loading text-2xl"></i>
                </div>
            )}

            <div className="card_body sharp">
                <LinkedPagination url="/admin/operations/columns" count={count} page_size={page_size} />
            </div>

            {isForm && <ColumnForm />}
        </>
    )
}

export default ColumnsPage

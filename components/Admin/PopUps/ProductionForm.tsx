'use client'
import { useEffect, useState } from 'react'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import OperationStore from '@/src/zustand/Operation'
import PenStore from '@/src/zustand/Pen'
import ColumnStore from '@/src/zustand/Column'

const ProductionForm: React.FC = () => {
    const {
        operationForm,
        loading,
        createOperation,
        updateOperation,
        setShowOperationForm,
        resetForm,
        setForm
    } = OperationStore()
    const { columns, getColumns } = ColumnStore()
    const { setMessage } = MessageStore()
    const { setAlert } = AlartStore()
    const { user } = AuthStore()

    const [productionValues, setProductionValues] = useState<Record<string, number>>({})

    useEffect(() => {
        getColumns('/columns', setMessage)
    }, [])

    useEffect(() => {
        if (operationForm._id) {
            const initialValues: Record<string, number> = {}
            operationForm.productionData?.forEach(item => {
                initialValues[item.columnId] = item.units
            })
            setProductionValues(initialValues)
        }
    }, [operationForm])

    const handleUnitChange = (columnId: string, value: string) => {
        const numValue = parseFloat(value) || 0
        setProductionValues(prev => ({
            ...prev,
            [columnId]: numValue
        }))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(name as any, value)
    }

    const handleSubmit = async () => {
        const productionData = columns.map(col => ({
            columnId: col._id,
            name: col.name,
            units: productionValues[col._id] || 0
        }))

        const payload = {
            ...operationForm,
            operation: 'Production',
            livestock: 'Bird',
            pen: operationForm.pen || user?.penHouse || '',
            penId: operationForm.penId || '', // If editing, keep existing penId
            productionData,
            staffName: user?.fullName || 'Unknown',
            userId: user?._id || ''
        }

        // Clean payload: remove empty _id for new records
        if (payload._id === "") delete (payload as any)._id

        setAlert(
            'Warning',
            `Are you sure you want to submit this production record for ${payload.pen}`,
            true,
            () => {
                const url = operationForm._id ? `/operations/${operationForm._id}` : '/operations'
                const action = operationForm._id ? updateOperation : createOperation

                action(url, payload, setMessage, () => {
                    setShowOperationForm(false)
                    resetForm()
                })
            }
        )
    }

    return (
        <div
            onClick={() => setShowOperationForm(false)}
            className="fixed h-full w-full z-50 left-0 top-0 bg-black/50 items-center justify-center flex p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="card_body sharp w-full max-w-[600px] max-h-[100vh] overflow-auto"
            >
                <div className="custom_sm_title text-center text-[var(--customRedColor)] h-auto mb-4">
                    {operationForm._id ? 'Update Daily Production' : 'Daily Production Record'}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {/* Pen Display (Read-only) */}
                    <div className="flex flex-col">
                        <label className="label">Pen / House</label>
                        <div className="form-input bg-[var(--primary)] pointer-events-none opacity-80">
                            {operationForm.pen || user?.penHouse || 'No Pen Assigned'}
                        </div>
                    </div>

                    {/* Staff Name (Locked) */}
                    <div className="flex flex-col">
                        <label className="label">Staff Name</label>
                        <div className="form-input bg-[var(--primary)] pointer-events-none opacity-80">
                            {user?.fullName}
                        </div>
                    </div>

                    {/* Dynamic Column Rows wrapped in a styled container */}
                    <div className="col-span-2 mt-2">
                        <label className="label mb-2">Production Breakdown (Units)</label>
                        <div className="grid grid-cols-2 gap-2 p-2 border border-[var(--border)] rounded">
                            {columns.length > 0 ? (
                                columns.map((col) => (
                                    <div key={col._id} className="flex flex-col">
                                        <label className="text-xs font-semibold mb-1 opacity-70">{col.name}</label>
                                        <input
                                            type="number"
                                            className="form-input !h-[40px]"
                                            placeholder="Units"
                                            value={productionValues[col._id] || ''}
                                            onChange={(e) => handleUnitChange(col._id, e.target.value)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 p-4 text-center text-[var(--text-secondary)] italic">
                                    No columns defined.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col mt-3">
                    <label className="label">Remark / Observation</label>
                    <textarea
                        placeholder="Enter if any remark or observation for this production"
                        className="form-input h-[80px]"
                        name="remark"
                        value={operationForm.remark}
                        onChange={handleInputChange}
                    ></textarea>
                </div>

                {/* Table Actions / Buttons */}
                <div className="table-action mt-5 flex justify-end gap-3">
                    {loading ? (
                        <button className="custom_btn">
                            <i className="bi bi-opencollective loading"></i>
                            Processing...
                        </button>
                    ) : (
                        <>
                            <button
                                className="custom_btn bg-[var(--customColor)]"
                                onClick={handleSubmit}
                                disabled={columns.length === 0}
                            >
                                {operationForm._id ? 'Update Record' : 'Submit Production'}
                            </button>

                            <button
                                className="custom_btn danger"
                                onClick={() => setShowOperationForm(false)}
                            >
                                Close
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductionForm

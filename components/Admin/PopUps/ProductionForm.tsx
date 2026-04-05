'use client'
import { useEffect, useState } from 'react'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import OperationStore, { Operation } from '@/src/zustand/Operation'
import ColumnStore from '@/src/zustand/Column'
import ProductStore, { Product } from '@/src/zustand/Product'

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
    const { products, getProducts } = ProductStore()
    const { setMessage } = MessageStore()
    const { setAlert } = AlartStore()
    const { user } = AuthStore()

    const [productionValues, setProductionValues] = useState<Record<string, number>>({})

    useEffect(() => {
        getColumns('/columns', setMessage)
        getProducts('/products?isProducing=true&page_size=100', setMessage)
    }, [getColumns, getProducts, setMessage])

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
        setForm(name as keyof Operation, value)
    }

    const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value
        const product = products.find((p: Product) => p._id === selectedId)
        
        // Reset manure-specific fields and production values when changing products
        setForm('quantity', '')
        setForm('unitName', '')
        setProductionValues({})

        if (product) {
            setForm('productId', product._id)
            setForm('productName', product.name)
            // For manure, we'll let the user select the unit in the form
            if (!product.name.toLowerCase().includes('manure')) {
                setForm('unitName', product.purchaseUnit)
            }
            setForm('unitPerPurchase', product.unitPerPurchase || 1)
        } else {
            setForm('productId', '')
            setForm('productName', '')
            setForm('unitName', '')
            setForm('unitPerPurchase', 1)
        }
    }

    const handleSubmit = async () => {
        if (!operationForm.productId) {
            setMessage('Please select a product being produced.', false)
            return
        }

        const isManure = operationForm.productName?.toLowerCase().includes('manure')

        if (isManure && (!operationForm.unitName || !operationForm.quantity)) {
            setMessage('Please select a unit and enter the quantity produced.', false)
            return
        }

        const productionData = isManure 
            ? [{ columnId: 'manure', name: operationForm.unitName || 'Production', units: Number(operationForm.quantity) }] 
            : columns.map(col => ({
            columnId: col._id,
            name: col.name,
            units: productionValues[col._id] || 0
        }))

        const payload = {
            ...operationForm,
            operation: 'Production',
            livestock: 'Bird',
            pen: operationForm.pen || user?.penHouse || '',
            penId: operationForm.penId || '',
            productionData,
            staffName: user?.fullName || 'Unknown',
            userId: user?._id || '',
            // Ensure quantity and unitName are correctly set for manure
            quantity: isManure ? String(operationForm.quantity) : "",
            unitName: operationForm.unitName || ""
        }

        // Clean payload: remove empty _id for new records
        if ((payload as Operation)._id === "") delete (payload as Partial<Operation>)._id

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
                    {/* Product Selection (Mandatory for production) */}
                    <div className="flex flex-col col-span-2 mb-2">
                        <label className="label text-[var(--customRedColor)] font-bold">Select Produced Product</label>
                        <select
                            className="form-input border-[var(--customRedColor)] border-2"
                            value={operationForm.productId}
                            onChange={handleProductSelect}
                        >
                            <option value="">-- Click to Select Product --</option>
                            {products.filter(p => p.isProducing).map(p => (
                                <option key={p._id} value={p._id}>{p.name} ({p.purchaseUnit})</option>
                            ))}
                        </select>
                    </div>

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

                    {/* Dynamic Column Rows or Manure Input */}
                    {operationForm.productName?.toLowerCase().includes('manure') ? (
                        <div className="col-span-2 mt-2">
                            <label className="label mb-2">Manure Production Details</label>
                            <div className="grid grid-cols-2 gap-4 p-3 border border-[var(--border)] rounded bg-[var(--primary)]/30">
                                <div className="flex flex-col">
                                    <label className="text-xs font-semibold mb-1 opacity-70">Bag Unit</label>
                                    <select
                                        className="form-input !h-[40px]"
                                        name="unitName"
                                        value={operationForm.unitName}
                                        onChange={(e) => setForm('unitName', e.target.value)}
                                    >
                                        <option value="">-- Select Unit --</option>
                                        <option value="Small Bag">Small Bag</option>
                                        <option value="Big Bag">Big Bag</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs font-semibold mb-1 opacity-70">Quantity Produced</label>
                                    <input
                                        type="number"
                                        className="form-input !h-[40px]"
                                        name="quantity"
                                        placeholder="Number of bags"
                                        value={operationForm.quantity}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
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
                    )}
                </div>

                <div className="flex flex-col mt-3">
                    <label className="label">Remark / Observation</label>
                    <input
                        placeholder="Enter if any remark or observation for this production"
                        className="form-input"
                        name="remark"
                        value={operationForm.remark}
                        onChange={handleInputChange}
                        type="text"
                    />
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

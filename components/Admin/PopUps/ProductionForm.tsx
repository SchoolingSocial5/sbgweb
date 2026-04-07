'use client'
import { useEffect, useState } from 'react'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import OperationStore, { Operation } from '@/src/zustand/Operation'
import PenStore, { Column } from '@/src/zustand/Column'
import ProductStore, { Product } from '@/src/zustand/Product'

const ProductionForm: React.FC = () => {
    const {
        operationForm,
        loading,
        createOperation,
        updateOperation,
        setShowOperationForm,
        resetForm,
        setForm,
        pendingOperations,
        addPendingOperation,
        updatePendingOperation,
        editingPendingIndex,
        setEditingPendingIndex,
        currentFilter,
        clearPendingOperations
    } = OperationStore()
    const { pens, getPens } = PenStore()
    const { products, getProducts } = ProductStore()
    const { setMessage } = MessageStore()
    const { setAlert } = AlartStore()
    const { user } = AuthStore()

    const [productionValues, setProductionValues] = useState<Record<string, number>>({})
    const [currentColumns, setCurrentColumns] = useState<Column[]>([])

    useEffect(() => {
        getPens('/pens', setMessage)
        getProducts('/products?isProducing=true&page_size=100', setMessage)
    }, [getPens, getProducts, setMessage])

    useEffect(() => {
        // Find pen-specific columns when pen changes or form loads
        const penName = operationForm.pen || user?.penHouse
        if (penName && pens.length > 0) {
            const selectedPen = pens.find(p => p.name === penName)
            if (selectedPen) {
                setCurrentColumns(selectedPen.columns || [])
                // Auto-set pen and penId in form if not already set
                if (!operationForm.pen) setForm('pen', selectedPen.name)
                if (!operationForm.penId) setForm('penId', selectedPen._id)
            }
        }
    }, [operationForm.pen, pens, user?.penHouse, setForm])

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

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
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

    const preparePayload = () => {
        const isManure = operationForm.productName?.toLowerCase().includes('manure') && !operationForm.productName?.toLowerCase().includes('egg')

        const productionData = currentColumns.map(col => ({
            columnId: col._id,
            name: col.name,
            units: productionValues[col._id] || 0
        }))

        const payload: Partial<Operation> = {
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

        if (payload._id === "") delete payload._id
        
        if (isManure) {
            // For Manure, we don't use dynamic columns (productionData)
            payload.productionData = []
        }
        
        return payload
    }

    const handleEditRecord = (index: number) => {
        const record = pendingOperations[index]
        if (record) {
            // Set form values
            Object.keys(record).forEach(key => {
                if (key !== 'productionData') {
                    setForm(key as keyof Operation, (record as any)[key])
                }
            })
            
            // Set production values
            const newProdValues: Record<string, number> = {}
            record.productionData.forEach(item => {
                newProdValues[item.columnId] = item.units
            })
            setProductionValues(newProdValues)
            setEditingPendingIndex(index)
            setMessage(`Editing Record ${index + 1}`, true)
        }
    }

    const handleAddMore = () => {
        if (!operationForm.productId) {
            setMessage('Please select a product being produced.', false)
            return
        }

        const payload = preparePayload()
        
        if (editingPendingIndex !== null) {
            updatePendingOperation(editingPendingIndex, payload as Operation)
        } else {
            addPendingOperation(payload as Operation)
        }

        // Reset form for next entry but keep pen
        const currentPen = operationForm.pen
        const currentPenId = operationForm.penId
        resetForm()
        setForm('pen', currentPen)
        setForm('penId', currentPenId)
        setProductionValues({})
    }

    const handleSubmit = async () => {
        const currentPayload = operationForm.productId ? preparePayload() : null
        const allPayloads = [...pendingOperations]
        if (currentPayload) allPayloads.push(currentPayload as Operation)

        if (allPayloads.length === 0) {
            setMessage('Please add at least one production record.', false)
            return
        }

        const isUpdate = !!operationForm._id && allPayloads.length === 1

        setAlert(
            'Warning',
            `Are you sure you want to submit ${allPayloads.length} production record(s)?`,
            true,
            () => {
                const query = currentFilter ? `?${currentFilter}` : ''
                const url = isUpdate ? `/operations/${operationForm._id}${query}` : `/operations${query}`
                const action = isUpdate ? updateOperation : createOperation
                const finalPayload = isUpdate ? allPayloads[0] : allPayloads

                action(url, finalPayload, setMessage, () => {
                    setShowOperationForm(false)
                    resetForm()
                    clearPendingOperations()
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
                        <label className="label text-[var(--customRedColor)] font-bold">Select Produced Product {operationForm.unitName && <span className="opacity-60 text-xs font-normal">({operationForm.unitName})</span>}</label>
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

                    {/* Pen Selection (Locked to User's Pen) */}
                    <div className="flex flex-col">
                        <label className="label text-xs opacity-70">Pen / House</label>
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

                    {/* Conditional Input Section: Manure vs Eggs/Others */}
                    {(() => {
                        const isManure = operationForm.productName?.toLowerCase().includes('manure') && !operationForm.productName?.toLowerCase().includes('egg')
                        
                        if (isManure) {
                            return (
                                <div className="col-span-2 grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[var(--border)]">
                                    <div className="flex flex-col">
                                        <label className="label">Bag Size</label>
                                        <select 
                                            className="form-input" 
                                            name="unitName" 
                                            value={operationForm.unitName}
                                            onChange={(e) => setForm('unitName', e.target.value)}
                                        >
                                            <option value="">Select Bag Size</option>
                                            <option value="Small Bag">Small Bag</option>
                                            <option value="Big Bag">Big Bag</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="label">Number of Bags</label>
                                        <input 
                                            type="number" 
                                            className="form-input" 
                                            placeholder="Enter quantity"
                                            name="quantity"
                                            value={operationForm.quantity}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <div className="col-span-2 mt-2">
                                <label className="label mb-2">Production Breakdown (Units)</label>
                                <div className="grid grid-cols-2 gap-2 p-2 border border-[var(--border)] rounded">
                                    {currentColumns.length > 0 ? (
                                        currentColumns.map((col) => (
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
                                            No columns defined for the selected Pen.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })()}
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

                {/* Batch Records Display */}
                {pendingOperations.length > 0 && (
                    <div className="mt-4 border-t pt-3">
                        <label className="label mb-2 text-xs opacity-70">Current Batch Records (Click to Edit)</label>
                        <div className="flex flex-wrap gap-2">
                            {pendingOperations.map((_, index) => (
                                <div key={index} className="relative group">
                                    <button
                                        onClick={() => handleEditRecord(index)}
                                        className={`px-3 py-1 text-xs rounded border transition-all ${
                                            editingPendingIndex === index 
                                            ? 'bg-[var(--customColor)] text-white border-[var(--customColor)]' 
                                            : 'bg-[var(--primary)] border-[var(--border)] hover:border-[var(--customColor)]'
                                        }`}
                                    >
                                        Record {index + 1}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removePendingOperation(index)
                                            if (editingPendingIndex === index) resetForm()
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Table Actions / Buttons */}
                <div className="table-action mt-5 flex justify-end gap-3 flex-wrap">
                    {loading ? (
                        <button className="custom_btn">
                            <i className="bi bi-opencollective loading"></i>
                            Processing...
                        </button>
                    ) : (
                        <>
                            <button
                                className="custom_btn bg-green-600 !text-white"
                                onClick={handleAddMore}
                                disabled={currentColumns.length === 0 || (!operationForm.productId && editingPendingIndex === null)}
                                type="button"
                            >
                                <i className={`bi ${editingPendingIndex !== null ? 'bi-check-circle' : 'bi-plus-circle'} mr-1`}></i>
                                {editingPendingIndex !== null ? `Update` : `Add More ${pendingOperations.length > 0 ? `(${pendingOperations.length})` : ''}`}
                            </button>

                            {editingPendingIndex !== null && (
                                <button
                                    className="custom_btn bg-gray-500 !text-white"
                                    onClick={() => resetForm()}
                                    type="button"
                                >
                                    Cancel
                                </button>
                            )}

                            <button
                                className="custom_btn bg-[var(--customColor)]"
                                onClick={handleSubmit}
                                disabled={currentColumns.length === 0 && pendingOperations.length === 0}
                            >
                                {operationForm._id ? 'Update Record' : `Submit ${pendingOperations.length + (operationForm.productId && editingPendingIndex === null ? 1 : 0)} Records`}
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

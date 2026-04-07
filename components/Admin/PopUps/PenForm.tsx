'use client'
import React, { useState, useEffect } from 'react'
import PenStore, { Pen, Column } from '@/src/zustand/Pen'
import { MessageStore } from '@/src/zustand/notification/Message'
import ProductStore from '@/src/zustand/Product'

const PenForm: React.FC = () => {
    const { penForm, setForm, createPen, updatePen, loading } = PenStore()
    const { buyingProducts } = ProductStore()
    const { setMessage } = MessageStore()
    
    // Local state for managing dynamic columns during form edit
    const [localColumns, setLocalColumns] = useState<string[]>([''])

    useEffect(() => {
        if (penForm._id && penForm.columns) {
            setLocalColumns(penForm.columns.map(c => c.name))
        } else {
            setLocalColumns([''])
        }
    }, [penForm])

    const handleAddColumn = () => {
        setLocalColumns([...localColumns, ''])
    }

    const handleRemoveColumn = (index: number) => {
        const updated = localColumns.filter((_, i) => i !== index)
        setLocalColumns(updated.length ? updated : [''])
    }

    const handleColumnChange = (index: number, value: string) => {
        const updated = [...localColumns]
        updated[index] = value
        setLocalColumns(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!penForm.name.trim()) {
            setMessage('Pen name is required', false)
            return
        }

        const validColumns = localColumns
            .filter(name => name.trim() !== '')
            .map(name => ({ name }))

        if (validColumns.length === 0) {
            setMessage('Alleast one production column is required', false)
            return
        }

        const payload = {
            ...penForm,
            columns: validColumns
        }

        const url = penForm._id ? `/pens/${penForm._id}` : '/pens'
        const action = penForm._id ? updatePen : createPen
        
        await action(url, payload, setMessage, () => {
            PenStore.setState({ isForm: false })
        })
    }

    return (
        <div
            onClick={() => PenStore.setState({ isForm: false })}
            className="fixed h-full w-full z-50 left-0 top-0 bg-black/50 items-center justify-center flex p-4"
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="card_body sharp w-full max-w-[500px] bg-white box_shadow"
            >
                <div className="custom_sm_title text-center text-[var(--customRedColor)] mb-4">
                    {penForm._id ? 'Update Pen House' : 'Create New Pen House'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col">
                        <label className="label font-bold text-sm mb-1">Pen House Name</label>
                        <input
                            type="text"
                            className="form-input border-2 border-[var(--customColor)]"
                            placeholder="e.g. Pen A, House 1"
                            value={penForm.name}
                            onChange={(e) => setForm('name', e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="label font-bold text-sm mb-1 italic opacity-70">Associated Livestock (Optional)</label>
                        <select 
                            className="form-input border-2 border-[var(--border)]"
                            value={penForm.livestockId || ""}
                            onChange={(e) => {
                                const prod = buyingProducts.find(p => p._id === e.target.value);
                                setForm('livestockId', e.target.value);
                                setForm('livestockName', prod ? prod.name : "");
                            }}
                        >
                            <option value="">-- No Livestock --</option>
                            {buyingProducts
                                .filter(p => p.type === 'Livestock')
                                .map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                <div className="flex flex-col mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="label font-bold text-sm">Production Columns (Egg Types)</label>
                        <button 
                            type="button" 
                            onClick={handleAddColumn}
                            className="text-xs bg-[var(--customColor)] text-white px-2 py-1 rounded flex items-center"
                        >
                            <i className="bi bi-plus-lg mr-1"></i> Add Many
                        </button>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto pr-2 flex flex-col gap-2">
                        {localColumns.map((colName, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    className="form-input flex-1"
                                    placeholder={`Column ${index + 1} (e.g. Jumbo)`}
                                    value={colName}
                                    onChange={(e) => handleColumnChange(index, e.target.value)}
                                    required={index === 0}
                                />
                                {localColumns.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveColumn(index)}
                                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => PenStore.setState({ isForm: false })}
                        className="custom_btn bg-gray-500 text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="custom_btn bg-[var(--customColor)] text-white"
                    >
                        {loading ? <i className="bi bi-opencollective loading mr-1"></i> : null}
                        {penForm._id ? 'Update Pen' : 'Create Pen'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PenForm

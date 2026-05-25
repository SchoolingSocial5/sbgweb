'use client'
import React, { useState } from 'react'
import { Transaction } from '@/src/zustand/Transaction'
import { formatMoney } from '@/lib/helpers'
import TransactionStore from '@/src/zustand/Transaction'
import { MessageStore } from '@/src/zustand/notification/Message'

interface PurchaseEditFormProps {
  transaction: Transaction
  onClose: () => void
}

const PurchaseEditForm: React.FC<PurchaseEditFormProps> = ({ transaction, onClose }) => {
  const { setMessage } = MessageStore()
  const { updateTransaction } = TransactionStore()
  const [formData, setFormData] = useState<Transaction>({ ...transaction })
  const [loading, setLoading] = useState(false)

  const handleProductChange = (field: 'cartUnits' | 'costPrice', val: number) => {
    const updatedProduct = { ...formData.product }
    if (field === 'cartUnits') {
      updatedProduct.cartUnits = Math.max(1, val)
    } else {
      updatedProduct.costPrice = Math.max(0, val)
    }

    // Recalculate total amount
    const newTotal = (updatedProduct.costPrice || 0) * (updatedProduct.cartUnits || 0)

    setFormData({
      ...formData,
      product: updatedProduct,
      totalAmount: newTotal,
      adjustedTotal: newTotal
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Construct request payload
    // Note: The /transactions/:id patch endpoint accepts both multipart/form-data and application/json.
    // For purchase edits, we send a JSON object since there are no file uploads, or a FormData.
    // To match TransactionEditForm precisely, we use FormData.
    const body = new FormData()
    body.append('supName', formData.supName || '')
    body.append('supPhone', formData.supPhone || '')
    body.append('supAddress', formData.supAddress || '')
    body.append('remark', formData.remark || '')
    body.append('payment', formData.payment || 'Cash')
    body.append('totalAmount', String(formData.totalAmount))
    body.append('adjustedTotal', String(formData.totalAmount))
    body.append('product', JSON.stringify(formData.product))

    await updateTransaction(
      `/transactions/${formData._id}`,
      body,
      setMessage,
      () => {
        onClose()
      }
    )
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-[var(--secondary)] text-[var(--text-primary)] p-6 w-full max-w-[700px] shadow-2xl relative rounded-sm border border-[var(--border)]">
        <div className="flex justify-between items-center mb-6 border-bottom border-[var(--border)] pb-3">
          <h2 className="text-xl font-bold flex items-center">
            <i className="bi bi-pencil-square mr-2 text-[var(--customColor)]"></i>
            Edit Purchase Transaction
          </h2>
          <button onClick={onClose} className="text-2xl hover:text-[var(--customRedColor)] transition-colors">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm opacity-70">Supplier Name</label>
              <input 
                type="text" 
                name="supName"
                value={formData.supName || ''}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm opacity-70">Supplier Phone</label>
              <input 
                type="text" 
                name="supPhone"
                value={formData.supPhone || ''}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm opacity-70">Supplier Address</label>
              <input 
                type="text" 
                name="supAddress"
                value={formData.supAddress || ''}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
          </div>

          <div className="border border-[var(--border)] rounded-sm overflow-hidden">
            <div className="bg-[var(--primary)] p-2 text-sm font-bold border-b border-[var(--border)]">
              Product Details (Adjust Quantity and Cost Price)
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-base font-semibold">{formData.product?.name}</div>
                  <div className="text-xs opacity-60">Unit: {formData.product?.purchaseUnit || 'units'}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs opacity-70">Cost Price (₦)</label>
                    <input 
                      type="number" 
                      value={formData.product?.costPrice || 0}
                      onChange={(e) => handleProductChange('costPrice', parseFloat(e.target.value) || 0)}
                      className="form-input w-32 bg-transparent text-right"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-xs opacity-70">Quantity</label>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => handleProductChange('cartUnits', (formData.product?.cartUnits || 1) - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-[var(--primary)] border border-[var(--border)] rounded hover:bg-[var(--border)]"
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <input 
                        type="number" 
                        value={formData.product?.cartUnits || 1}
                        onChange={(e) => handleProductChange('cartUnits', parseInt(e.target.value) || 1)}
                        className="w-12 text-center bg-transparent border-b border-[var(--border)] outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => handleProductChange('cartUnits', (formData.product?.cartUnits || 1) + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-[var(--primary)] border border-[var(--border)] rounded hover:bg-[var(--border)]"
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[var(--primary)] p-3 flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-[var(--customRedColor)]">₦{formatMoney(formData.totalAmount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm opacity-70">Payment Method</label>
              <select 
                name="payment"
                value={formData.payment}
                onChange={handleInputChange}
                className="form-input w-full bg-[var(--secondary)]"
              >
                <option value="Cash">Cash</option>
                <option value="Transfer">Transfer</option>
                <option value="POS">POS</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm opacity-70">Remarks</label>
              <textarea 
                name="remark"
                value={formData.remark || ''}
                onChange={handleInputChange}
                className="form-input w-full h-20 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-[var(--border)]">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-[var(--success)] text-white py-3 rounded font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <i className="bi bi-arrow-repeat animate-spin mr-2"></i> : <i className="bi bi-check-circle mr-2"></i>}
              Save Changes
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 rounded font-bold hover:opacity-90 flex items-center justify-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PurchaseEditForm

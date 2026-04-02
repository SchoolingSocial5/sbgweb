'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Transaction } from '@/src/zustand/Transaction'
import { formatMoney } from '@/lib/helpers'
import TransactionStore from '@/src/zustand/Transaction'
import { MessageStore } from '@/src/zustand/notification/Message'

interface TransactionEditFormProps {
  transaction: Transaction
  onClose: () => void
}

const TransactionEditForm: React.FC<TransactionEditFormProps> = ({ transaction, onClose }) => {
  const { setMessage } = MessageStore()
  const { updateTransaction } = TransactionStore()
  const [formData, setFormData] = useState<Transaction>({ ...transaction })
  const [loading, setLoading] = useState(false)

  const handleQuantityChange = (index: number, newUnits: number) => {
    const updatedCart = [...formData.cartProducts]
    updatedCart[index] = { ...updatedCart[index], cartUnits: Math.max(1, newUnits) }
    
    // Recalculate total amount
    const newTotal = updatedCart.reduce((sum, item) => {
      const price = item.adjustedPrice || item.price
      return sum + (price * item.cartUnits)
    }, 0)

    setFormData({
      ...formData,
      cartProducts: updatedCart,
      totalAmount: newTotal,
      adjustedTotal: newTotal // Keep them in sync for now unless user specifies otherwise
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // We send the cartProducts as a string for the backend multer handling
    const body = new FormData()
    body.append('fullName', formData.fullName)
    body.append('phone', formData.phone)
    body.append('address', formData.address)
    body.append('remark', formData.remark)
    body.append('payment', formData.payment)
    body.append('status', String(formData.status))
    body.append('totalAmount', String(formData.totalAmount))
    body.append('adjustedTotal', String(formData.totalAmount))
    body.append('cartProducts', JSON.stringify(formData.cartProducts))

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
            Edit Transaction: <span className="text-[var(--customRedColor)] ml-2">{formData.invoiceNumber}</span>
          </h2>
          <button onClick={onClose} className="text-2xl hover:text-[var(--customRedColor)] transition-colors">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm opacity-70">Customer Name</label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm opacity-70">Phone Number</label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm opacity-70">Address</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
          </div>

          <div className="border border-[var(--border)] rounded-sm overflow-hidden">
            <div className="bg-[var(--primary)] p-2 text-sm font-bold border-b border-[var(--border)]">
              Products (Adjust Quantities)
            </div>
            <div className="max-h-[300px] overflow-auto">
              {formData.cartProducts.map((item, index) => (
                <div key={index} className="p-3 border-b border-[var(--border)] last:border-0 flex items-center gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0 bg-[var(--primary)] rounded overflow-hidden">
                    {item.picture ? (
                      <Image src={String(item.picture)} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[10px]">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.name}</div>
                    <div className="text-xs opacity-60">₦{formatMoney(item.adjustedPrice || item.price)} per {item.purchaseUnit}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => handleQuantityChange(index, item.cartUnits - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-[var(--primary)] border border-[var(--border)] rounded hover:bg-[var(--border)]"
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <input 
                      type="number" 
                      value={item.cartUnits}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                      className="w-12 text-center bg-transparent border-b border-[var(--border)] outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => handleQuantityChange(index, item.cartUnits + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-[var(--primary)] border border-[var(--border)] rounded hover:bg-[var(--border)]"
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                  <div className="text-sm font-bold w-24 text-right">
                    ₦{formatMoney((item.adjustedPrice || item.price) * item.cartUnits)}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[var(--primary)] p-3 flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-[var(--customRedColor)]">₦{formatMoney(formData.totalAmount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm opacity-70">Payment Status</label>
              <select 
                name="status"
                value={String(formData.status)}
                onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                className="form-input w-full bg-[var(--secondary)]"
              >
                <option value="true">Paid</option>
                <option value="false">Pending</option>
              </select>
            </div>
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
                value={formData.remark}
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

export default TransactionEditForm

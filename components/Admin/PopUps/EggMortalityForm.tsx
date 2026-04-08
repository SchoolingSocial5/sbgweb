'use client'
import React, { useState } from 'react'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import MortalityStore from '@/src/zustand/Mortality'
import ProductStore, { Product } from '@/src/zustand/Product'

interface EggMortalityFormProps {
  product: Product
  onClose: () => void
}

const EggMortalityForm: React.FC<EggMortalityFormProps> = ({ product, onClose }) => {
  const { postMortality, resetForm } = MortalityStore()
  const { decrementStock } = ProductStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const [quantity, setQuantity] = useState<string | number>('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!user) {
      setMessage('Please login to continue', false)
      return
    }

    const inputsToValidate = [
      { name: 'birds', value: Number(quantity), rules: { blank: false }, field: 'Quantity' },
      { name: 'reason', value: reason, rules: { blank: false, maxLength: 500 }, field: 'Reason' },
    ]

    const { messages } = validateInputs(inputsToValidate)
    const firstMessage = Object.values(messages).find(msg => msg.trim() !== '')
    if (firstMessage) {
      setMessage(firstMessage, false)
      return
    }

    const data = new FormData()
    data.append('productId', product._id)
    data.append('productName', product.name)
    data.append('birds', String(quantity))
    data.append('reason', reason)
    data.append('staffName', user.fullName)
    data.append('pen', user.penHouse || 'No Pen Assigned')
    data.append('birdClass', 'Egg Product')
    data.append('birdAge', 'N/A')

    setAlert(
      'Confirm Damage Report',
      `Are you sure you want to record ${quantity} units of damage for ${product.name}?`,
      true,
      async () => {
        setLoading(true)
        await postMortality(`/mortalities?ordering=-createdAt`, data, setMessage, () => {
          // Real-time frontend stock deduction
          decrementStock(product._id, Number(quantity))
          
          onClose()
          resetForm()
        })
        setLoading(false)
      }
    )
  }

  return (
    <div
      onClick={onClose}
      className="fixed h-full w-full z-[60] left-0 top-0 bg-black/50 items-center justify-center flex p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card_body sharp w-full max-w-[500px] bg-white shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-3">
          <div className="flex flex-col">
            <div className="text-xl font-bold text-[var(--customRedColor)]">Record Egg Damage</div>
            <div className="text-xs opacity-60 font-medium uppercase tracking-wider">{product.name}</div>
          </div>
          <div onClick={onClose} className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors">
            <i className="bi bi-x-lg text-xl"></i>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="flex justify-between items-center bg-[var(--primary)] p-3 rounded border border-[var(--border)]">
             <div className="flex flex-col">
                <span className="text-[10px] opacity-60 font-bold uppercase">Current Global Stock</span>
                <span className="font-bold text-lg">{product.units} <span className="text-xs opacity-60 font-normal">{product.purchaseUnit}</span></span>
             </div>
             <div className="flex flex-col text-right">
                <span className="text-[10px] opacity-60 font-bold uppercase">Pen / House</span>
                <span className="font-bold text-sm text-[var(--customColor)]">{user?.penHouse || 'N/A'}</span>
             </div>
          </div>

          <div className="flex flex-col">
            <label className="label font-bold text-xs mb-1 uppercase opacity-70">Damage Quantity</label>
            <input
              autoFocus
              className="form-input border-[var(--customRedColor)] !text-lg !font-bold"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              placeholder="0"
            />
          </div>

          <div className="flex flex-col">
            <label className="label font-bold text-xs mb-1 uppercase opacity-70">Reason / Observation</label>
            <textarea
              className="form-input min-h-[100px] resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Cracked during collection, spoiled, etc."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 border-t border-[var(--border)] pt-5">
          <button className="custom_btn bg-gray-100 !text-gray-600 hover:bg-gray-200" onClick={onClose}>
            Cancel
          </button>
          <button 
            className={`custom_btn !bg-[var(--customRedColor)] flex items-center ${loading ? 'opacity-70 pointer-events-none' : ''}`} 
            onClick={handleSubmit}
          >
            {loading ? <i className="bi bi-opencollective loading mr-2"></i> : <i className="bi bi-shield-exclamation mr-2"></i>}
            Submit Damage Record
          </button>
        </div>
      </div>
    </div>
  )
}

export default EggMortalityForm

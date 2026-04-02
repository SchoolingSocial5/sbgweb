'use client'
import { useState } from 'react'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { MessageStore } from '@/src/zustand/notification/Message'
import ProductStore from '@/src/zustand/Product'
import QuillEditor from '../QuillEditor'
import PictureDisplay from '@/components/PictureDisplay'
import { X } from 'lucide-react'

const BuyProductForm: React.FC = () => {
  const {
    setForm,
    resetForm,
    postProduct,
    updateProduct,
    productForm,
    loading,
    setShowBuyProductForm,
  } = ProductStore()
  
  const { setMessage } = MessageStore()
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange =
    (key: keyof typeof productForm) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null
        setForm(key, file)
        if (key === 'picture' && file) {
          const localUrl = URL.createObjectURL(file)
          setPreview(localUrl)
        }
      }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof productForm, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const inputsToValidate = [
      {
        name: 'supName',
        value: productForm.supName,
        rules: { blank: true, maxLength: 100 },
        field: 'Supplier Name field',
      },
      {
        name: 'costPrice',
        value: productForm.costPrice,
        rules: { blank: true, maxLength: 100 },
        field: 'Cost price field',
      },
      {
        name: 'supAddress',
        value: productForm.supAddress,
        rules: { blank: false, maxLength: 200 },
        field: 'Address field',
      },
      {
        name: 'supPhone',
        value: productForm.supPhone,
        rules: { blank: true, maxLength: 20 },
        field: 'Phone number field',
      },
      {
        name: 'name',
        value: productForm.name,
        rules: { blank: false, maxLength: 100 },
        field: 'Product Name field',
      },
      {
        name: 'picture',
        value: productForm.picture,
        rules: { blank: false, maxLength: 1000 },
        field: 'Picture field',
      },
      {
        name: 'isBuyable',
        value: true,
        rules: { blank: false },
        field: 'Buyable field',
      },
      {
        name: 'remark',
        value: productForm.remark,
        rules: { blank: false, maxSize: 500 },
        field: 'Remark field',
      },
      {
        name: 'unitPerPurchase',
        value: productForm.unitPerPurchase,
        rules: { blank: false },
        field: 'Unit per purchase',
      },
      {
        name: 'purchaseUnit',
        value: productForm.purchaseUnit,
        rules: { blank: true, maxSize: 50 },
        field: 'Purchase unit name',
      },
      {
        name: 'type',
        value: productForm.type,
        rules: { blank: false },
        field: 'Product type field',
      },
    ]

    const { messages } = validateInputs(inputsToValidate)
    const getFirstNonEmptyMessage = (
      messages: Record<string, string>
    ): string | null => {
      for (const key in messages) {
        if (messages[key].trim() !== '') {
          return messages[key]
        }
      }
      return null
    }

    const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
    if (firstNonEmptyMessage) {
      setMessage(firstNonEmptyMessage, false)
      return
    }

    const data = appendForm(inputsToValidate)
    
    const queryParams = `?page_size=20&page=1&ordering=-createdAt`
    
    if (productForm._id) {
      await updateProduct(`/products/${productForm._id}${queryParams}`, data, setMessage, () => {
        setShowBuyProductForm(false)
        resetForm()
      })
    } else {
      await postProduct(`/products${queryParams}`, data, setMessage, () => {
        setShowBuyProductForm(false)
        resetForm()
      })
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => setShowBuyProductForm(false)}
    >
      <div 
        className="bg-[var(--primary)] w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--primary)] z-10 px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--customRedColor)]">
            {productForm._id ? 'Update' : 'Create'} {productForm.type} Product
          </h2>
          <button 
            onClick={() => setShowBuyProductForm(false)}
            className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="label">Suppliers Name</label>
              <input
                className="form-input"
                name="supName"
                value={productForm.supName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter supplier name"
              />
            </div>
            <div className="flex flex-col">
              <label className="label">Suppliers Address</label>
              <input
                className="form-input"
                name="supAddress"
                value={productForm.supAddress}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter address"
              />
            </div>
            <div className="flex flex-col">
              <label className="label">Suppliers Phone</label>
              <input
                className="form-input"
                name="supPhone"
                value={productForm.supPhone}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter phone"
              />
            </div>

            <div className="flex flex-col">
              <label className="label">Product Name</label>
              <input
                className="form-input"
                name="name"
                value={productForm.name}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter product name"
              />
            </div>

            <div className="flex flex-col">
              <label className="label">Product Unit Price (₦)</label>
              <input
                className="form-input"
                name="costPrice"
                value={productForm.costPrice}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter unit price"
              />
            </div>
            <div className="flex flex-col">
              <label className="label">Product Unit Name</label>
              <input
                className="form-input"
                name="purchaseUnit"
                value={productForm.purchaseUnit}
                onChange={handleInputChange}
                type="text"
                placeholder="e.g. Bag, Bottle"
              />
            </div>

            <div className="flex flex-col">
              <label className="label">Product Type</label>
              <select
                className="form-input text-gray-500"
                name="type"
                value={productForm.type}
                onChange={(e) => setForm('type', e.target.value as any)}
              >
                <option value="" disabled>Select Product Type</option>
                <option value="General">General</option>
                <option value="Feed">Feed</option>
                <option value="Medicine">Medicine</option>
                <option value="Livestock">Livestock</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col mb-6">
            <label className="label">Remark</label>
            <input
              className="form-input w-full"
              name="remark"
              value={productForm.remark}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter any additional remarks"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-[var(--border)]">
            {loading ? (
              <button disabled className="custom_btn">
                <i className="bi bi-opencollective loading"></i>
                Processing...
              </button>
            ) : (
              <>
                <label htmlFor="form_picture" className="custom_btn cursor-pointer">
                  <input
                    className="hidden"
                    type="file"
                    name="picture"
                    id="form_picture"
                    accept="image/*"
                    onChange={handleFileChange('picture')}
                  />
                  <i className="bi bi-cloud-arrow-up text-xl mr-2"></i>
                  {productForm.picture ? 'Change Picture' : 'Upload Picture'}
                </label>

                <button className="custom_btn bg-[var(--customRedColor)] text-white ml-auto" onClick={handleSubmit}>
                  Submit Product
                </button>
                <button 
                  className="custom_btn variant-outline" 
                  onClick={() => setShowBuyProductForm(false)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyProductForm

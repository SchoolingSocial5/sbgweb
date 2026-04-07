'use client'
import React, { useEffect, useState } from 'react'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { MessageStore } from '@/src/zustand/notification/Message'
import ProductStore from '@/src/zustand/Product'
import { X } from 'lucide-react'
import PenStore from '@/src/zustand/Pen'

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
  const { pens, getPens } = PenStore()
  const [distPen, setDistPen] = useState({ _id: '', name: '' })
  const [distUnits, setDistUnits] = useState(0)

  useEffect(() => {
    if (pens.length === 0) {
      getPens('/pens?page_size=100', setMessage)
    }
  }, [])

  const handleFileChange =
    (key: keyof typeof productForm) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null
        setForm(key, file)
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
        rules: { blank: false, maxLength: 100 },
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
      {
        name: 'units',
        value: productForm.units,
        rules: { blank: false },
        field: 'Total Units field'
      },
      {
        name: 'penDistributions',
        value: productForm.penDistributions,
        rules: { maxLength: 5000 },
        field: 'Distribution field',
      },
      {
        name: 'dateOfBirth',
        value: productForm.dateOfBirth,
        rules: { blank: productForm.type !== 'Livestock' },
        field: 'Date of Birth field',
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

    if (productForm.type === 'Livestock') {
      const distributions = productForm.penDistributions || [];
      const totalUnits = Number(productForm.units) || 0;
      const distributedUnits = distributions.reduce((sum, d) => sum + Number(d.units), 0);

      if (distributedUnits > totalUnits) {
        setMessage(`Total distributed units (${distributedUnits}) exceeds product quantity (${totalUnits})`, false);
        return;
      }
    }

    const data = appendForm(inputsToValidate)
    
    const queryParams = `?page_size=20&page=1&ordering=-createdAt&isBuyable=true`
    
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
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => setShowBuyProductForm(false)}
    >
      <div 
        className="bg-[var(--primary)] w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative max-md:!px-[10px]"
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
                onChange={(e) => setForm('type', e.target.value as 'Feed' | 'Medicine' | 'Water' | 'Livestock' | 'General')}
              >
                <option value="" disabled>Select Product Type</option>
                <option value="General">General</option>
                <option value="Feed">Feed</option>
                <option value="Medicine">Medicine</option>
                <option value="Water">Water</option>
                <option value="Livestock">Livestock</option>
              </select>
            </div>

            {productForm.type === 'Livestock' && (
              <div className="flex flex-col">
                <label className="label">Date of Birth</label>
                <input
                  className="form-input"
                  name="dateOfBirth"
                  value={productForm.dateOfBirth ? new Date(productForm.dateOfBirth).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  type="date"
                />
              </div>
            )}

            <div className="flex flex-col">
              <label className="label">Total Quantity (Units)</label>
              <input
                className="form-input"
                name="units"
                value={productForm.units}
                onChange={handleInputChange}
                type="number"
                placeholder="Total units"
              />
            </div>
          </div>

          {productForm.type === 'Livestock' && (
            <div className="my-5 border-t border-[var(--border)] pt-5">
              <div className="font-bold text-[var(--customRedColor)] mb-4 flex items-center uppercase text-sm tracking-wide">
                <i className="bi bi-diagram-3-fill mr-2"></i> Livestock Pen Distribution
              </div>
              
              <div className="flex flex-wrap items-end gap-2 mb-4">
                <div className="flex flex-col flex-1">
                  <select 
                    className="form-input text-xs" 
                    value={distPen._id} 
                    onChange={(e) => {
                      const pen = pens.find(p => p._id === e.target.value);
                      if(pen) setDistPen({ _id: pen._id, name: pen.name });
                      else setDistPen({ _id: '', name: '' });
                    }}
                  >
                    <option value="">-- Choose Pen --</option>
                    {(pens || []).filter(p => !productForm.penDistributions?.some(d => d.penId === p._id)).map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col w-[80px]">
                  <input 
                    type="number" 
                    className="form-input text-xs" 
                    placeholder="Qty" 
                    value={distUnits || ""} 
                    onChange={(e) => setDistUnits(Number(e.target.value))}
                  />
                </div>

                <button 
                  onClick={() => {
                    if(!distPen._id || !distUnits) return setMessage("Select pen and enter quantity", false);
                    const existing = productForm.penDistributions || [];
                    if(existing.find(e => e.penId === distPen._id)) return setMessage("Pen already in list.", false);

                    const updated = [...existing, { penId: distPen._id, penName: distPen.name, units: distUnits }];
                    setForm('penDistributions', updated);
                    setDistPen({ _id: '', name: '' });
                    setDistUnits(0);
                  }}
                  className="custom_btn h-[38px] px-4 bg-[var(--customRedColor)] text-white text-xs"
                >Add</button>
              </div>

              {productForm.penDistributions && productForm.penDistributions.length > 0 && (
                <div className="border border-[var(--border)] rounded overflow-hidden">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-[var(--secondary)]">
                        <th className="p-2 text-left opacity-70">Pen House</th>
                        <th className="p-2 text-right opacity-70">Quantity</th>
                        <th className="p-2 text-center opacity-70">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productForm.penDistributions.map((row, idx) => (
                        <tr key={idx} className="border-b border-[var(--border)] last:border-0">
                          <td className="p-2">{row.penName}</td>
                          <td className="p-2 text-right font-bold">
                            {row.units}
                          </td>
                          <td className="p-2 text-center">
                            <i 
                              onClick={() => {
                                const updated = productForm.penDistributions.filter((_, i) => i !== idx);
                                setForm('penDistributions', updated);
                              }}
                              className="bi bi-trash text-red-500 cursor-pointer"
                            ></i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

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

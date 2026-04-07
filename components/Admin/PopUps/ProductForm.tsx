'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import ProductStore from '@/src/zustand/Product'
import { X } from 'lucide-react'
import PenStore from '@/src/zustand/Pen'
import { useEffect } from 'react'

const ProductForm: React.FC = () => {
  const {
    setForm,
    resetForm,
    postProduct,
    updateProduct,
    getProducts,
    productForm,
    loading,
    setShowProductForm,
  } = ProductStore()
  const url = '/products'
  const { setMessage } = MessageStore()
  const { pens, getPens } = PenStore()
  const [distPen, setDistPen] = useState({ _id: '', name: '' })
  const [distUnits, setDistUnits] = useState(0)
  const [currentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

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
        name: 'name',
        value: productForm.name,
        rules: { blank: true, maxLength: 100 },
        field: 'Name field',
      },
      {
        name: 'costPrice',
        value: productForm.costPrice,
        rules: { blank: false, maxLength: 100 },
        field: 'Cost price field',
      },
      {
        name: 'price',
        value: productForm.price,
        rules: { blank: false, maxLength: 100 },
        field: 'Price field',
      },
      {
        name: 'unitPerPurchase',
        value: productForm.unitPerPurchase,
        rules: { blank: false, maxLength: 100 },
        field: 'Unit field',
      },
      {
        name: 'purchaseUnit',
        value: productForm.purchaseUnit,
        rules: { blank: true, maxLength: 100 },
        field: 'Purchase Unit field',
      },
      {
        name: 'isBuyable',
        value: false,
        rules: { maxLength: 100 },
        field: 'Buyable field',
      },
      {
        name: 'seoTitle',
        value: productForm.seoTitle,
        rules: { blank: false, maxLength: 100 },
        field: 'SEO title field',
      },
      {
        name: 'picture',
        value: productForm.picture,
        rules: { blank: false, maxLength: 1000 },
        field: 'Picture field',
      },
      {
        name: 'description',
        value: productForm.description,
        rules: { blank: false, maxSize: 5000 },
        field: 'Description file',
      },
      {
        name: 'isProducing',
        value: productForm.isProducing,
        rules: { maxLength: 100 },
        field: 'Is Producing Field'
      },
      {
        name: 'type',
        value: productForm.type,
        rules: { blank: false },
        field: 'Product Type field'
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
    if (productForm._id) {
      updateProduct(`${url}/${productForm._id}${queryParams}`, data, setMessage, () => {
        setShowProductForm(false)
        resetForm()
        getProducts(`${url}${queryParams}`, setMessage)
      })
    } else {
      postProduct(`${url}${queryParams}`, data, setMessage, () => {
        setShowProductForm(false)
        resetForm()
        getProducts(`${url}${queryParams}`, setMessage)
      })
    }
  }

  return (
    <div 
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => setShowProductForm(false)}
    >
      <div 
        className="bg-[var(--primary)] w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative max-md:!px-[10px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--primary)] z-10 px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--customRedColor)]">
            {productForm._id ? 'Update' : 'Create'} Product
          </h2>
          <button 
            onClick={() => setShowProductForm(false)}
            className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Name
              </label>
              <input
                className="form-input"
                name="name"
                value={productForm.name}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter name"
              />
            </div>

            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Title
              </label>
              <input
                className="form-input"
                name="seoTitle"
                value={productForm.seoTitle}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter title"
              />
            </div>

            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Cost Price
              </label>
              <input
                className="form-input"
                name="costPrice"
                value={productForm.costPrice}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter cost price"
              />
            </div>

            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Unit Per Purchase
              </label>
              <input
                className="form-input"
                name="unitPerPurchase"
                value={productForm.unitPerPurchase}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter unit per purchase"
              />
            </div>

            {productForm.type === 'Livestock' && (
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Date of Birth
                </label>
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
              <label className="label" htmlFor="">
                Selling Price
              </label>
              <input
                className="form-input"
                name="price"
                value={productForm.price}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter selling price"
              />
            </div>

            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Purchase Unit Name
              </label>
              <input
                className="form-input"
                name="purchaseUnit"
                value={productForm.purchaseUnit}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter purchase unit name"
              />
            </div>


            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Product Type
              </label>
              <select
                className="form-input"
                name="type"
                value={productForm.type}
                onChange={(e) => setForm('type', e.target.value as typeof productForm.type)}
              >
                <option value="General">General</option>
                <option value="Feed">Feed</option>
                <option value="Medicine">Medicine</option>
                <option value="Water">Water</option>
                <option value="Livestock">Livestock</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-4 ml-2">
              <input
                type="checkbox"
                id="isProducing"
                className="w-5 h-5 cursor-pointer accent-[var(--customRedColor)]"
                checked={productForm.isProducing}
                onChange={(e) => setForm('isProducing', e.target.checked)}
              />
              <label htmlFor="isProducing" className="label cursor-pointer !mb-0 font-bold">
                Is Producing? (Internal Production)
              </label>
            </div>

            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Total Quantity (Units)
              </label>
              <input
                className="form-input"
                name="units"
                value={productForm.units}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter total units"
              />
            </div>
          </div>

          {productForm.type === 'Livestock' && (
            <div className="my-5 border-t border-[var(--border)] pt-5">
              <div className="font-bold text-[var(--customRedColor)] mb-4 flex items-center uppercase text-sm tracking-wide">
                <i className="bi bi-diagram-3-fill mr-2"></i> Livestock Pen Distribution
              </div>
              
              <div className="flex flex-wrap items-end gap-3 mb-6">
                <div className="flex flex-col flex-1 min-w-[180px]">
                  <label className="label !text-[10px] uppercase opacity-50 font-bold">Select Pen House</label>
                  <select 
                    className="form-input" 
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

                <div className="flex flex-col w-[100px]">
                  <label className="label !text-[10px] uppercase opacity-50 font-bold">Quantity</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="0" 
                    value={distUnits || ""} 
                    onChange={(e) => setDistUnits(Number(e.target.value))}
                  />
                </div>

                <button 
                  onClick={() => {
                    if(!distPen._id || !distUnits) return setMessage("Select pen and enter quantity", false);
                    const existing = productForm.penDistributions || [];
                    if(existing.find(e => e.penId === distPen._id)) return setMessage("Pen already in list", false);

                    const updated = [...existing, { penId: distPen._id, penName: distPen.name, units: distUnits }];
                    setForm('penDistributions', updated);
                    setDistPen({ _id: '', name: '' });
                    setDistUnits(0);
                  }}
                  className="custom_btn h-[45px] px-6 bg-[var(--customRedColor)] text-white hover:opacity-90"
                >Add</button>
              </div>

              {productForm.penDistributions && productForm.penDistributions.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-[var(--secondary)] border-b border-[var(--border)]">
                        <th className="p-3 text-left font-bold opacity-70">Pen House</th>
                        <th className="p-3 text-right font-bold opacity-70">Quantity</th>
                        <th className="p-3 text-center font-bold opacity-70">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productForm.penDistributions.map((row, idx) => (
                        <tr key={idx} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors">
                          <td className="p-3">{row.penName}</td>
                          <td className="p-3 text-right font-bold">
                            {row.units}
                          </td>
                          <td className="p-3 text-center">
                            <i 
                              onClick={() => {
                                const updated = productForm.penDistributions.filter((_, i) => i !== idx);
                                setForm('penDistributions', updated);
                              }}
                              className="bi bi-trash text-red-500 cursor-pointer hover:scale-110 transition-transform"
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

          <div className="flex flex-col mt-4">
            <label className="label" htmlFor="description">
              Description
            </label>
            <input
              className="form-input"
              name="description"
              id="description"
              type="text"
              value={productForm.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
            {loading ? (
              <button disabled className="custom_btn opacity-70">
                <i className="bi bi-opencollective loading mr-2"></i>
                Processing...
              </button>
            ) : (
              <>
                <label htmlFor="picture" className="custom_btn">
                  <input
                    className="hidden"
                    type="file"
                    name="picture"
                    id="picture"
                    accept="image/*"
                    onChange={handleFileChange('picture')}
                  />
                  <i className="bi bi-cloud-arrow-up text-lg mr-2"></i>
                  Picture
                </label>

                <button className="custom_btn" onClick={handleSubmit}>
                  Submit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductForm

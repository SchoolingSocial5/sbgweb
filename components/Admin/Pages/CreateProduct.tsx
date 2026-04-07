'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import ProductStore from '@/src/zustand/Product'
import QuillEditor from '../QuillEditor'
import PictureDisplay from '@/components/PictureDisplay'
import PenStore from '@/src/zustand/Pen'

const CreateProduct: React.FC = () => {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const {
    getProduct,
    setForm,
    resetForm,
    postProduct,
    updateProduct,
    productForm,
    loading,
    products,
  } = ProductStore()
  const url = '/products'
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { id } = useParams()
  const router = useRouter()
  const { pens, getPens } = PenStore()
  const [preview, setPreview] = useState<string | null>(null)
  const [distPen, setDistPen] = useState({ _id: '', name: '' })
  const [distUnits, setDistUnits] = useState(0)
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

  useEffect(() => {
    const initialize = async () => {
      if (id) {
        const existingItem = products.find((item) => item._id === String(id))
        if (existingItem) {
          ProductStore.setState({ productForm: existingItem })
        } else {
          await getProduct(`${url}/${id}`, setMessage)
        }
      }
      if (typeParam) {
        setForm('type', typeParam as 'Feed' | 'Medicine' | 'Water' | 'General' | 'Livestock')
      }
      if (pens.length === 0) {
        getPens('/pens?page_size=100', setMessage)
      }
    }

    initialize()
    return () => {
      resetForm()
    }
  }, [id, typeParam, getProduct, products, resetForm, setForm, setMessage, url])

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
        rules: { blank: false, maxLength: 50 },
        field: 'Product type field',
      },
      {
        name: 'penDistributions',
        value: productForm.penDistributions,
        rules: { maxLength: 5000 },
        field: 'Distribution field',
      },
      {
        name: 'units',
        value: productForm.units,
        rules: { blank: false, maxLength: 100 },
        field: 'Total Units field',
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

    e.preventDefault()

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
    if (id) {
      updateProduct(`${url}/${id}${queryParams}`, data, setMessage, () =>
        router.push(`/admin/products`)
      )
    } else {
      postProduct(`${url}${queryParams}`, data, setMessage, () =>
        router.push(`/admin/products`)
      )
    }
  }

  return (
    <>
      <div className="card_body sharp max-md:!px-[10px]">
        <div className="custom_sm_title">
          {id ? `Update Product` : `Create Product`}
        </div>

        <div className="grid-2 grid-lay">
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
              placeholder="Enter units per purchase"
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
              Price
            </label>
            <input
              className="form-input"
              name="price"
              value={productForm.price}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter price"
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
              onChange={(e) => setForm('type', e.target.value as 'Feed' | 'Medicine' | 'Water' | 'Livestock' | 'General')}
            >
              <option value="General">General</option>
              <option value="Feed">Feed</option>
              <option value="Medicine">Medicine</option>
              <option value="Water">Water</option>
              <option value="Livestock">Livestock</option>
            </select>
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

              <div className="flex flex-col w-[120px]">
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

        <div className="flex w-full justify-center">
          <div className="relative my-5 w-full max-w-[200px] h-[150px] rounded-xl  overflow-hidden">
            {preview ? (
              <PictureDisplay source={String(preview)} />
            ) : productForm?.picture ? (
              <PictureDisplay source={String(productForm.picture)} />
            ) : (
              <div className="bg-[var(--secondary)] h-full w-full" />
            )}
          </div>
        </div>

        <QuillEditor
          contentValue={productForm.description}
          onChange={(content) => setForm('description', content)}
        />

        <div className="table-action flex flex-wrap">
          {loading ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <label htmlFor="picture" className="custom_btn mr-3">
                <input
                  className="input-file"
                  type="file"
                  name="picture"
                  id="picture"
                  accept="image/*"
                  onChange={handleFileChange('picture')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Picture
              </label>

              <button className="custom_btn" onClick={handleSubmit}>
                Submit
              </button>
              <Link href="/admin/products" className="custom_btn ml-auto ">
                Product Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateProduct

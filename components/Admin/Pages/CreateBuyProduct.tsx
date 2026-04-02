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

const CreateBuyProduct: React.FC = () => {
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
  const [preview, setPreview] = useState<string | null>(null)
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
        setForm('type', typeParam as 'Feed' | 'Medicine' | 'General')
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
        name: 'supName',
        value: productForm.supName,
        rules: { blank: true, maxLength: 100 },
        field: 'Name field',
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
        rules: { blank: false, maxLength: 100 },
        field: 'Address field',
      },
      {
        name: 'supPhone',
        value: productForm.supPhone,
        rules: { blank: true, maxLength: 100 },
        field: 'Phone number field',
      },
      {
        name: 'name',
        value: productForm.name,
        rules: { blank: false, maxLength: 100 },
        field: 'Name title field',
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
        name: 'unitPerPurchase',
        value: productForm.unitPerPurchase,
        rules: { blank: false, maxSize: 5000 },
        field: 'Unit per purchase',
      },
      {
        name: 'purchaseUnit',
        value: productForm.purchaseUnit,
        rules: { blank: true, maxSize: 5000 },
        field: 'Product unit name',
      },
      {
        name: 'type',
        value: productForm.type,
        rules: { blank: false, maxLength: 50 },
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

    e.preventDefault()
    const data = appendForm(inputsToValidate)
    if (id) {
      updateProduct(`${url}/${id}${queryParams}`, data, setMessage, () =>
        router.back()
      )
    } else {
      postProduct(`${url}${queryParams}`, data, setMessage, () => router.back())
    }
  }

  return (
    <>
      <div className="card_body sharp">
        <div className="custom_sm_title">
          {id ? `Update Product` : `Create Product`}
        </div>

        <div className="grid-3 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Suppliers Name
            </label>
            <input
              className="form-input"
              name="supName"
              value={productForm.supName}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter product name"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Suppliers Address
            </label>
            <input
              className="form-input"
              name="supAddress"
              value={productForm.supAddress}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter suppliers address"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Suppliers Phone
            </label>
            <input
              className="form-input"
              name="supPhone"
              value={productForm.supPhone}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter suppliers phone"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Product Name
            </label>
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
            <label className="label" htmlFor="">
              Product Unit Price
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
              Product Unit Name
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
              onChange={(e) => setForm('type', e.target.value as 'Feed' | 'Medicine' | 'Livestock' | 'General')}
            >
              <option value="General">General</option>
              <option value="Feed">Feed</option>
              <option value="Medicine">Medicine</option>
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
        </div>

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

        <div className="flex justify-center">
          <QuillEditor
            contentValue={productForm.description}
            onChange={(content) => setForm('description', content)}
          />
        </div>
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

export default CreateBuyProduct

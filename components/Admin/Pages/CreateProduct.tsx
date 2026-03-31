'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useParams, useRouter } from 'next/navigation'
import ProductStore from '@/src/zustand/Product'
import QuillEditor from '../QuillEditor'
import PictureDisplay from '@/components/PictureDisplay'

const CreateProduct: React.FC = () => {
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
    }

    initialize()
    return () => {
      resetForm()
    }
  }, [id])

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
        rules: { blank: true, maxLength: 100 },
        field: 'Cost price field',
      },
      {
        name: 'price',
        value: productForm.price,
        rules: { blank: true, maxLength: 100 },
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
      <div className="card_body sharp">
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
              placeholder="Enter cost price"
            />
          </div>

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

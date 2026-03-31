'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import StockingStore from '@/src/zustand/Stocking'
import ProductStore, { Product } from '@/src/zustand/Product'
import { ProductEmpty } from '@/src/zustand/Transaction'

const StockingForm: React.FC = () => {
  const {
    reshuffleResults,
    stockingFrom,
    loading,
    postStocking,
    updateStocking,
    setStockingForm,
    setShowStocking,
  } = StockingStore()
  const { setMessage } = MessageStore()
  const { products, productForm } = ProductStore()
  const [isBird, toggleBird] = useState(false)
  const [isParent, toggleParent] = useState(false)
  const [parentId, setParentId] = useState('')
  const [parent, setParent] = useState('')
  const pathname = usePathname()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const url = '/products/stocking'

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  const selectFeed = (p: Product) => {
    ProductStore.setState({ productForm: p })
    toggleBird(false)
  }

  const selectParent = (p: Product) => {
    setParentId(p._id)
    setParent(p.name)
    toggleParent(false)
  }

  const handleFileChange =
    (key: keyof typeof stockingFrom) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null
        setStockingForm(key, file)
      }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setStockingForm(name as keyof typeof stockingFrom, value)
  }

  const handleSubmit = async (e: boolean) => {
    if (stockingFrom.units <= 0) {
      setMessage('The product units cannot be less than 1', false)
      return
    }

    if (!user) {
      setMessage('Please login to continue', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'staffName',
        value: user?.fullName,
        rules: { blank: true, minLength: 10, maxLength: 100 },
        field: 'Staff Name field',
      },
      {
        name: 'name',
        value: stockingFrom.name,
        rules: { blank: true, maxLength: 100 },
        field: 'Name field',
      },
      {
        name: 'amount',
        value: stockingFrom.amount * stockingFrom.units,
        rules: { blank: true, minLength: 1, maxLength: 100 },
        field: 'Amount field',
      },
      {
        name: 'productId',
        value: stockingFrom.productId,
        rules: { blank: true, maxLength: 100 },
        field: 'Name field',
      },
      {
        name: 'parentProductId',
        value: parentId,
        rules: { blank: false, maxLength: 100 },
        field: 'Name field',
      },
      {
        name: 'units',
        value: stockingFrom.units,
        rules: { blank: true, maxLength: 100 },
        field: 'Unit field',
      },
      {
        name: 'reason',
        value: stockingFrom.reason,
        rules: { blank: false, maxLength: 100 },
        field: 'Reason field',
      },
      {
        name: 'video',
        value: stockingFrom.video,
        rules: { blank: false, maxLength: 1000 },
        field: 'Video field',
      },
      {
        name: 'isProfit',
        value: e,
        rules: { blank: false, maxLength: 1000 },
        field: 'Condition field',
      },
      {
        name: 'picture',
        value: stockingFrom.picture,
        rules: { blank: false, maxSize: 5000 },
        field: 'Picture file',
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
    alertAndSubmit(data)
  }

  const alertAndSubmit = (data: FormData) => {
    setAlert(
      'Warning',
      'Are you sure you want to submit this stock record',
      true,
      () =>
        stockingFrom._id
          ? updateStocking(
            `${url}/${stockingFrom._id}/?ordering=-createdAt`,
            data,
            setMessage,
            () => setShowStocking(false)
          )
          : postStocking(`${url}/?ordering=-createdAt`, data, setMessage, () => {
            setShowStocking(false)
            ProductStore.setState({ productForm: ProductEmpty })
          }
          )
    )
  }

  return (
    <>
      <div
        onClick={() => setShowStocking(false)}
        className="fixed h-full w-full z-50 left-0 top-0 bg-black/50 items-center justify-center flex"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="card_body sharp w-full max-w-[600px] max-h-[100vh] overflow-auto"
        >

          <div className="custom_sm_title text-center">{stockingFrom.name}</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Units
              </label>
              <input
                className="form-input"
                name="units"
                value={stockingFrom.units}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter units"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Select Product
              </label>
              <div className="relative">
                <div
                  onClick={() => toggleBird((e) => !e)}
                  className="form-input cursor-pointer"
                >
                  {productForm._id ? productForm.name : 'Select Product'}
                  <i
                    className={`bi bi-caret-down-fill ml-auto ${isBird ? 'active' : ''
                      }`}
                  ></i>
                </div>
                {isBird && (
                  <div className="dropdownList">
                    {products.map((item, index) => (
                      <div
                        onClick={() => selectFeed(item)}
                        key={index}
                        className="p-3 cursor-pointer border-b border-b-[var(--border)]"
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Parent Product
              </label>
              <div className="relative">
                <div
                  onClick={() => toggleParent((e) => !e)}
                  className="form-input cursor-pointer"
                >
                  {parent ? parent : 'Select Parent Product'}
                  <i
                    className={`bi bi-caret-down-fill ml-auto ${isParent ? 'active' : ''
                      }`}
                  ></i>
                </div>
                {isParent && (
                  <div className="dropdownList">
                    {products.map((item, index) => (
                      <div
                        onClick={() => selectParent(item)}
                        key={index}
                        className="p-3 cursor-pointer border-b border-b-[var(--border)]"
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {stockingFrom._id && (
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Amount
                </label>
                <input
                  className="form-input"
                  name="amount"
                  value={stockingFrom.amount}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Enter amount"
                />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Reason
            </label>
            <textarea
              placeholder="Enter if any reason for any damages"
              className="form-input"
              name="reason"
              value={stockingFrom.reason}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="table-action mt-3 flex flex-wrap">
            {loading ? (
              <button className="custom_btn">
                <i className="bi bi-opencollective loading"></i>
                Processing...
              </button>
            ) : (
              <>
                <label htmlFor="video" className="custom_btn mr-3">
                  <input
                    className="input-file"
                    type="file"
                    name="video"
                    id="video"
                    accept="image/*"
                    onChange={handleFileChange('video')}
                  />
                  <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                  Video
                </label>

                <button
                  className="custom_btn mr-3"
                  onClick={() => handleSubmit(true)}
                >
                  Produced
                </button>

                <button
                  className="custom_btn danger"
                  onClick={() => handleSubmit(false)}
                >
                  Damaged
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default StockingForm
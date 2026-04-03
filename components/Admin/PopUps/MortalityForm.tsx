'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import MortalityStore from '@/src/zustand/Mortality'
import ProductStore, { Product } from '@/src/zustand/Product'

const MortalityForm: React.FC = () => {
  const {
    mortalityForm,
    loading,
    updateMortality,
    postMortality,
    setForm,
    resetForm,
    setShowMortalityForm,
    reshuffleResults,
  } = MortalityStore()
  const { livestockProducts, getLivestock } = ProductStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const [isLivestock, toggleLivestock] = useState(false)
  const url = `/mortalities`

  useEffect(() => {
    reshuffleResults()
  }, [pathname, reshuffleResults])

  useEffect(() => {
    if (livestockProducts.length === 0) {
      getLivestock(`/products?type=Livestock&page_size=100&ordering=name`, setMessage)
    }
  }, [])

  const selectLivestock = (product: Product) => {
    MortalityStore.setState((prev) => {
      return {
        mortalityForm: {
          ...prev.mortalityForm,
          productName: product.name,
          productId: product._id,
          birdClass: product.name, // Usually the class is the product name for livestock
        },
      }
    })
    toggleLivestock(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof mortalityForm, value)
  }

  const handleSubmit = async () => {
    if (!user) {
      setMessage('Please login to continue', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'staffName',
        value: user?.fullName,
        rules: { blank: true },
        field: 'Staff Name field',
      },
      {
        name: 'productId',
        value: mortalityForm.productId,
        rules: { blank: false },
        field: 'Livestock product field',
      },
      {
        name: 'birds',
        value: mortalityForm.birds,
        rules: { blank: false },
        field: 'Quantity of Birds field',
      },
      {
        name: 'birdAge',
        value: mortalityForm.birdAge,
        rules: { blank: false },
        field: 'Bird age field',
      },
      {
         name: 'birdClass',
         value: mortalityForm.birdClass,
         rules: { blank: false },
         field: 'Bird class field',
      },
      {
        name: 'reason',
        value: mortalityForm.reason,
        rules: { blank: false, maxLength: 500 },
        field: 'Reason of Death field',
      },
      {
        name: 'pen',
        value: user?.penHouse || "",
        rules: { blank: false, maxLength: 100 },
        field: 'Pen field',
      },
      {
        name: 'productName',
        value: mortalityForm.productName,
        rules: { blank: false },
        field: 'Product Name field',
      }
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
      'Are you sure you want to record this mortality?',
      true,
      () =>
        mortalityForm._id
          ? updateMortality(
            `${url}/${mortalityForm._id}/?ordering=-createdAt`,
            data,
            setMessage,
            () => {
              setShowMortalityForm(false)
              resetForm()
            }
          )
          : postMortality(
            `${url}?ordering=-createdAt`,
            data,
            setMessage,
            () => {
              setShowMortalityForm(false)
              resetForm()
            }
          )
    )
  }

  return (
    <>
      <div
        onClick={() => setShowMortalityForm(false)}
        className="fixed h-full w-full z-50 left-0 top-0 bg-black/50 items-center justify-center flex"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="card_body sharp w-full max-w-[600px] max-h-[100vh] overflow-auto"
        >
          <div className="flex justify-between items-center mb-4 border-b border-[var(--border)] pb-2">
            <div className="text-xl font-bold">Record Mortality</div>
            <div 
               onClick={() => setShowMortalityForm(false)}
               className="cursor-pointer text-[var(--customRedColor)] hover:opacity-70"
            >
               <i className="bi bi-x-lg text-xl"></i>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Select Livestock
              </label>
              <div className="relative">
                <div
                  onClick={() => toggleLivestock((e) => !e)}
                  className="form-input cursor-pointer"
                >
                  {mortalityForm.productName ? mortalityForm.productName : 'Select Livestock Product'}
                  <i
                    className={`bi bi-caret-down-fill ml-auto ${isLivestock ? 'active' : ''}`}
                  ></i>
                </div>
                {isLivestock && (
                  <div className="dropdownList">
                    {livestockProducts.length === 0 ? (
                      <div className="p-3 text-[var(--text-secondary)]">No livestock products found</div>
                    ) : (
                      livestockProducts.map((item, index) => (
                        <div
                          onClick={() => selectLivestock(item)}
                          key={index}
                          className="p-3 cursor-pointer border-b border-b-[var(--border)]"
                        >
                          {item.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Quantity (Birds)
                </label>
                <input
                  className="form-input"
                  name="birds"
                  value={mortalityForm.birds}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Count of birds"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Bird Age
                </label>
                <input
                  className="form-input"
                  name="birdAge"
                  value={mortalityForm.birdAge}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Age e.g. 10 weeks"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Reason of Death
              </label>
              <input
                className="form-input"
                name="reason"
                value={mortalityForm.reason}
                onChange={handleInputChange}
                type="text"
                placeholder="Describe the cause or observation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="label" htmlFor="">
                        Staff Recording
                    </label>
                    <div className="form-input bg-[var(--primary)] pointer-events-none opacity-80">{user?.fullName}</div>
                </div>
                <div className="flex flex-col">
                    <label className="label" htmlFor="">
                        Pen / House
                    </label>
                    <div className="form-input bg-[var(--primary)] pointer-events-none opacity-80">{user?.penHouse || "No Pen Assigned"}</div>
                </div>
            </div>
          </div>

          <div className="table-action gap-3 mt-6 flex justify-end">
            {loading ? (
              <button className="custom_btn">
                <i className="bi bi-opencollective loading mr-2"></i>
                Processing...
              </button>
            ) : (
              <>
                <button
                  className="custom_btn danger"
                  onClick={() => setShowMortalityForm(false)}
                >
                  Cancel
                </button>
                <button className="custom_btn" onClick={handleSubmit}>
                  Submit Record
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default MortalityForm

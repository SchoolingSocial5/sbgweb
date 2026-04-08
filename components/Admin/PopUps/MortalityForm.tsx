'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import MortalityStore from '@/src/zustand/Mortality'
import ProductStore, { Product } from '@/src/zustand/Product'
import PenStore from '@/src/zustand/Pen'

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
  const { buyingProducts, getBuyingProducts } = ProductStore()
  const { pens, getPens } = PenStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const [isLivestock, toggleLivestock] = useState(false)
  const url = `/mortalities`

  useEffect(() => {
    reshuffleResults()
    getPens('/pens?page_size=100&page=1', setMessage)
    getBuyingProducts('/products?page_size=100&page=1', setMessage)
  }, [pathname, reshuffleResults, getPens, getBuyingProducts, setMessage])

  const calculateAge = (dob: any) => {
    if (!dob) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dob)
    const diffTime = Math.abs(today.getTime() - birthDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 7) return `${diffDays} Day${diffDays !== 1 ? 's' : ''}`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} Week${weeks !== 1 ? 's' : ''}`
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30.4375) // avg month
      return `${months} Month${months !== 1 ? 's' : ''}`
    }
    const years = Math.floor(diffDays / 365.25)
    return `${years} Year${years !== 1 ? 's' : ''}`
  }

  const selectProduct = (product: Product) => {
    const isEggProduct = product.name.toLowerCase().includes('egg')
    const staffPenName = user?.penHouse || ""
    const pen = pens.find(p => p.name === staffPenName)
    
    // For Egg products, show total units. For Livestock, show units in the specific pen.
    let displayUnits = product.units
    if (!isEggProduct) {
      const distribution = product.penDistributions?.find(d => d.penName === staffPenName || d.penId === pen?._id)
      displayUnits = distribution ? distribution.units : 0
    }

    const age = calculateAge(product.dateOfBirth)

    setForm('productName', product.name)
    setForm('productId', product._id)
    setForm('birdClass', isEggProduct ? 'Egg Product' : product.name)
    setForm('birds', displayUnits) 
    setForm('birdAge', isEggProduct ? 'N/A' : age)
    
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
        rules: { blank: false },
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
        value: Number(mortalityForm.birds_input),
        rules: { blank: false },
        field: 'Quantity field',
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
        field: 'Reason/Observation field',
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
            <div className="grid grid-cols-2 gap-4 border-b border-[var(--border)] pb-4">
              <div className="flex flex-col">
                <label className="label uppercase !text-[10px] opacity-50 font-bold" htmlFor="">
                  Staff Recording
                </label>
                <div className="font-bold text-sm">{user?.fullName}</div>
              </div>
              <div className="flex flex-col text-right">
                <label className="label uppercase !text-[10px] opacity-50 font-bold" htmlFor="">
                  Pen / House
                </label>
                <div className="font-bold text-sm text-[var(--customRedColor)]">{user?.penHouse || "No Pen Assigned"}</div>
              </div>
            </div>

            <div className="flex flex-col mt-2">
              <label className="label" htmlFor="">
                Select Product (Livestock or Egg)
              </label>
              <div className="relative">
                <div
                  onClick={() => toggleLivestock((e) => !e)}
                  className="form-input cursor-pointer flex justify-between items-center"
                >
                  {mortalityForm.productName ? mortalityForm.productName : 'Select Product'}
                  <i
                    className={`bi bi-caret-down-fill ml-auto ${isLivestock ? 'rotate-180 transition-transform' : ''}`}
                  ></i>
                </div>
                {isLivestock && (
                  <div className="dropdownList absolute left-0 right-0 mt-1 z-10 bg-white border border-[var(--border)] rounded shadow-lg max-h-[200px] overflow-y-auto">
                    {(() => {
                      const staffPenName = user?.penHouse || ""
                      const pen = pens.find(p => p.name === staffPenName)
                      const filtered = buyingProducts.filter(item => {
                        const isEgg = item.name.toLowerCase().includes('egg')
                        // Check matching by ID or by name of livestock assigned to pen
                        const isPenLivestock = pen && (item._id === pen.livestockId || item.name === pen.livestockName)
                        return isEgg || isPenLivestock
                      })

                      if (filtered.length === 0) {
                        return <div className="p-3 text-[var(--text-secondary)]">No relevant products found</div>
                      }

                      return filtered.map((item, index) => (
                        <div
                          onClick={() => selectProduct(item)}
                          key={index}
                          className="p-3 cursor-pointer border-b border-b-[var(--border)] hover:bg-[var(--primary)] flex justify-between items-center"
                        >
                          <span>{item.name}</span>
                          {(pen && (item._id === pen.livestockId || item.name === pen.livestockName)) && (
                            <span className="text-[10px] bg-[var(--customRedColor)] text-white px-2 py-1 rounded opacity-70">
                              Assigned Livestock
                            </span>
                          )}
                        </div>
                      ))
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 bg-[var(--primary)] rounded px-3">
              <div className="flex flex-col">
                <label className="label !text-[10px] opacity-60" htmlFor="">
                  Available in Pen
                </label>
                <div className="font-bold">{mortalityForm.birds || 0}</div>
              </div>
              <div className="flex flex-col text-right">
                <label className="label !text-[10px] opacity-60" htmlFor="">
                  Bird Age
                </label>
                <div className="font-bold">{mortalityForm.birdAge || 'N/A'}</div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Quantity (Mortality / Damage)
              </label>
              <input
                className="form-input border-[var(--customRedColor)]"
                name="birds"
                value={mortalityForm.birds_input || ''}
                onChange={(e) => setForm('birds_input', e.target.value)}
                type="number"
                placeholder="Enter amount"
              />
            </div>

            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Reason / Observation
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

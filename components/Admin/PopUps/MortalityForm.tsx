import { useEffect, useState } from 'react'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import MortalityStore from '@/src/zustand/Mortality'
import ProductStore, { Product } from '@/src/zustand/Product'
import PenStore from '@/src/zustand/Pen'
import { calculateBirdAge } from '@/lib/helpers'

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
  const { buyingProducts, getBuyingProducts, decrementStock } = ProductStore()
  const { pens, getPens } = PenStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const [submitting, setSubmitting] = useState(false)
  const url = `/mortalities`

  const isDirector = user?.staffPositions?.includes('Director') || user?.staffPositions === 'Director'
  const selectedPenName = isDirector ? (mortalityForm.pen || user?.penHouse || "") : (user?.penHouse || "")

  const currentPen = pens.find(p => p.name === selectedPenName);
  const livestocksForPen = currentPen 
    ? buyingProducts.filter(p => p.type === 'Livestock' && (p.penDistributions?.some(d => d.penId === currentPen._id || d.penName === currentPen.name) || p._id === currentPen.livestockId || p.name === currentPen.livestockName))
    : [];

  useEffect(() => {
    reshuffleResults()
    getPens('/pens?page_size=100&page=1', setMessage)
    getBuyingProducts('/products?page_size=100&page=1', setMessage)
  }, [reshuffleResults, getPens, getBuyingProducts, setMessage])

  useEffect(() => {
    if (pens.length > 0 && buyingProducts.length > 0 && !mortalityForm.productId) {
      const initialPenName = user?.penHouse || (isDirector ? pens[0]?.name : "");
      if (initialPenName) {
        const pen = pens.find(p => p.name === initialPenName);
        if (pen) {
          const livestock = buyingProducts.find(p => p.type === 'Livestock' && (p.penDistributions?.some(d => d.penId === pen?._id || d.penName === pen.name) || p._id === pen.livestockId || p.name === pen.livestockName));
          if (livestock) {
              const distribution = livestock.penDistributions?.find(d => d.penName === initialPenName || d.penId === pen?._id)
              const displayUnits = distribution ? distribution.units : 0
              const age = calculateBirdAge(distribution?.dateOfBirth || livestock.dateOfBirth)

              setForm('pen', initialPenName)
              setForm('productName', livestock.name)
              setForm('productId', livestock._id)
              setForm('birdClass', livestock.name)
              setForm('birds', displayUnits) 
              setForm('birdAge', age)
          } else {
              setForm('pen', initialPenName)
          }
        }
      }
    }
  }, [user?.penHouse, pens, buyingProducts, mortalityForm.productId, isDirector])

  const handlePenChange = (penName: string) => {
    setForm('pen', penName)
    const pen = pens.find(p => p.name === penName)
    if (pen) {
      const livestock = buyingProducts.find(p => p.type === 'Livestock' && (p.penDistributions?.some(d => d.penId === pen?._id || d.penName === pen.name) || p._id === pen.livestockId || p.name === pen.livestockName))
      if (livestock) {
        const distribution = livestock.penDistributions?.find(d => d.penName === penName || d.penId === pen?._id)
        const displayUnits = distribution ? distribution.units : 0
        const age = calculateBirdAge(distribution?.dateOfBirth || livestock.dateOfBirth)

        setForm('productName', livestock.name)
        setForm('productId', livestock._id)
        setForm('birdClass', livestock.name)
        setForm('birds', displayUnits) 
        setForm('birdAge', age)
      } else {
        setForm('productName', '')
        setForm('productId', '')
        setForm('birdClass', '')
        setForm('birds', 0) 
        setForm('birdAge', 'N/A')
      }
    } else {
      setForm('productName', '')
      setForm('productId', '')
      setForm('birdClass', '')
      setForm('birds', 0) 
      setForm('birdAge', 'N/A')
    }
  }

  const selectProduct = (product: Product) => {
    const staffPenName = selectedPenName
    const pen = pens.find(p => p.name === staffPenName)
    
    // For Livestock, show units in the specific pen.
    const distribution = product.penDistributions?.find(d => d.penName === staffPenName || d.penId === pen?._id)
    const displayUnits = distribution ? distribution.units : 0

    const age = calculateBirdAge(distribution?.dateOfBirth || product.dateOfBirth)

    setForm('productName', product.name)
    setForm('productId', product._id)
    setForm('birdClass', product.name)
    setForm('birds', displayUnits) 
    setForm('birdAge', age)
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
        value: selectedPenName,
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

    const data = new FormData()
    inputsToValidate.forEach(input => {
      data.append(input.name, String(input.value))
    })

    alertAndSubmit(data)
  }

  const alertAndSubmit = (data: FormData) => {
    setAlert(
      'Warning',
      'Are you sure you want to record this mortality?',
      true,
      () =>
        mortalityForm._id
          ? (setSubmitting(true), updateMortality(
            `${url}/${mortalityForm._id}/?ordering=-createdAt`,
            data,
            setMessage,
            () => {
              setShowMortalityForm(false)
              resetForm()
              setSubmitting(false)
            }
          ))
          : (setSubmitting(true), postMortality(
            `${url}?ordering=-createdAt`,
            data,
            setMessage,
            () => {
              // Real-time frontend stock deduction
              decrementStock(mortalityForm.productId, Number(mortalityForm.birds_input), selectedPenName)
              
              setShowMortalityForm(false)
              resetForm()
              setSubmitting(false)
            }
          ))
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
                {isDirector ? (
                  <select
                    value={selectedPenName}
                    onChange={(e) => handlePenChange(e.target.value)}
                    className="form-input py-1 px-2 text-xs font-semibold bg-white border border-gray-300 rounded outline-none focus:border-[var(--customColor)] cursor-pointer text-[var(--customRedColor)] text-right mt-1"
                  >
                    <option value="">Select Pen</option>
                    {pens.map((p) => (
                      <option key={p._id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="font-bold text-sm text-[var(--customRedColor)]">{selectedPenName || "No Pen Assigned"}</div>
                )}
              </div>
            </div>

            <div className="flex flex-col mt-2">
              <label className="label uppercase !text-[10px] opacity-50 font-bold" htmlFor="">
                Product (Livestock)
              </label>
              {livestocksForPen.length > 1 ? (
                <select
                  value={mortalityForm.productId || ''}
                  onChange={(e) => {
                    const livestock = buyingProducts.find(p => p._id === e.target.value);
                    if (livestock) selectProduct(livestock);
                  }}
                  className="form-input py-1 px-2 text-sm font-semibold bg-white border border-gray-300 rounded outline-none focus:border-[var(--customColor)] cursor-pointer text-[var(--customRedColor)]"
                >
                  <option value="" disabled>Select Livestock</option>
                  {livestocksForPen.map(l => (
                    <option key={l._id} value={l._id}>{l.name}</option>
                  ))}
                </select>
              ) : (
                <div className="form-input bg-gray-50 border-gray-200 pointer-events-none opacity-80 h-[45px] flex items-center font-bold">
                  {mortalityForm.productName ? mortalityForm.productName : 'No Livestock Assigned'}
                </div>
              )}
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
                <button 
                  className="custom_btn" 
                  onClick={handleSubmit}
                  disabled={loading || submitting}
                >
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

'use client'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import ConsumptionStore, { Consumption } from '@/src/zustand/Consumption'
import ProductStore, { Product } from '@/src/zustand/Product'
import PenStore from '@/src/zustand/Pen'

const ConsumptionForm: React.FC = () => {
  const {
    consumptionForm,
    loading,
    updateConsumption,
    postConsumption,
    setForm,
    resetForm,
    setShowConsumptionForm,
    reshuffleResults,
    pendingConsumptions,
    addPendingConsumption,
    removePendingConsumption,
    updatePendingConsumption,
    editingPendingIndex,
    setEditingPendingIndex,
    clearPendingConsumptions,
  } = ConsumptionStore()

  const { buyingProducts, getBuyingProducts } = ProductStore()
  const { pens, getPens } = PenStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { user } = AuthStore()

  const [isFeed, toggleFeed] = useState(false)
  const [isBirdClass, toggleBirdClass] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'Feed' | 'Medicine' | 'Water'>('Feed')
  const url = `/consumptions`

  useEffect(() => {
    reshuffleResults()
    getPens('/pens?page_size=100&page=1', setMessage)
    getBuyingProducts('/products?page_size=100&page=1&isBuyable=true', setMessage)
  }, [pathname, reshuffleResults, getPens, getBuyingProducts, setMessage])

  useEffect(() => {
    if (user?.penHouse && pens.length > 0 && buyingProducts.length > 0 && !consumptionForm._id) {
      const pen = pens.find(p => p.name === user.penHouse);
      if (pen && pen.livestockId) {
        const bird = buyingProducts.find(p => p._id === pen.livestockId);
        if (bird && consumptionForm.birdClass !== bird.name) {
          selectBirdClass(bird);
        }
      }
    }
  }, [user?.penHouse, pens, buyingProducts, consumptionForm.birdClass, consumptionForm._id])

  const selectFeed = (feed: Product) => {
    setForm('feed', feed.name)
    setForm('feedId', feed._id)
    setForm('consumptionUnit', feed.purchaseUnit)
    toggleFeed(false)
  }

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

  const selectBirdClass = (bird: Product) => {
    const staffPen = user?.penHouse || ""
    const distribution = bird.penDistributions?.find(d => d.penName === staffPen || d.penId === staffPen)
    const unitsInPen = distribution ? distribution.units : 0
    const age = calculateAge(bird.dateOfBirth)

    setForm('birdClass', bird.name)
    setForm('birds', unitsInPen)
    setForm('birdAge', age)
    toggleBirdClass(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    const numericFields = ['birds', 'consumption', 'amount', 'unitPrice']
    const finalValue = numericFields.includes(name) ? Number(value) : value
    setForm(name as keyof Consumption, finalValue)
  }

  const validate = () => {
    const inputsToValidate = [
      { name: 'feedId', value: consumptionForm.feedId, rules: { blank: false }, field: 'Feed' },
      { name: 'consumption', value: consumptionForm.consumption, rules: { blank: false }, field: 'Consumption Quantity' },
      { name: 'birdClass', value: consumptionForm.birdClass, rules: { blank: false }, field: 'Bird Class' },
      { name: 'pen', value: user?.penHouse || "", rules: { blank: false }, field: 'Pen' },
    ]
    const { messages } = validateInputs(inputsToValidate)
    for (const key in messages) {
      if (messages[key].trim() !== '') {
        setMessage(messages[key], false)
        return false
      }
    }
    return true
  }

  const preparePayload = () => {
    return {
      ...consumptionForm,
      staffName: user?.fullName || 'Unknown',
      pen: user?.penHouse || '',
    }
  }

  const handleAddMore = () => {
    if (!validate()) return

    const payload = preparePayload()

    if (editingPendingIndex !== null) {
      updatePendingConsumption(editingPendingIndex, payload as Consumption)
    } else {
      addPendingConsumption(payload as Consumption)
    }

    // Reset form for next entry but keep bird class info
    const currentClass = consumptionForm.birdClass
    const currentBirds = consumptionForm.birds
    const currentAge = consumptionForm.birdAge
    const currentWeight = consumptionForm.weight

    resetForm()

    setForm('birdClass', currentClass)
    setForm('birds', currentBirds)
    setForm('birdAge', currentAge)
    setForm('weight', currentWeight)
    setEditingPendingIndex(null)
  }

  const handleEditRecord = (index: number) => {
    const record = pendingConsumptions[index]
    if (record) {
      Object.keys(record).forEach(key => {
        setForm(key as any, (record as any)[key])
      })
      setEditingPendingIndex(index)
      setMessage(`Editing Batch Record ${index + 1}`, true)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setMessage('Please login to continue', false)
      return
    }

    const currentPayload = consumptionForm.feedId ? preparePayload() : null
    const allPayloads = [...pendingConsumptions]
    if (currentPayload && editingPendingIndex === null) allPayloads.push(currentPayload as Consumption)

    if (allPayloads.length === 0) {
      setMessage('Please add at least one consumption record.', false)
      return
    }

    const isUpdate = !!consumptionForm._id && allPayloads.length === 1
    const urlWithQuery = isUpdate
      ? `/consumptions/${consumptionForm._id}/?ordering=-createdAt`
      : `${url}?ordering=-createdAt`
    const action = isUpdate ? updateConsumption : postConsumption
    const finalPayload = isUpdate ? allPayloads[0] : allPayloads

    action(urlWithQuery, finalPayload, setMessage, () => {
      setShowConsumptionForm(false)
      resetForm()
      clearPendingConsumptions()
    })
  }

  return (
    <div
      onClick={() => {
        setShowConsumptionForm(false)
        resetForm()
        clearPendingConsumptions()
      }}
      className="fixed inset-0 h-full w-full z-50 bg-black/50 items-center justify-center flex p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card_body sharp w-full max-w-[800px] max-h-[100vh] overflow-y-auto bg-white"
      >
        <div className="grid sm:grid-cols-2 gap-4 mb-4 pb-4 border-b border-[var(--border)]">
          <div className="flex flex-col">
            <label className="label uppercase !text-[10px] opacity-50 font-bold text-gray-500">Staff</label>
            <div className="font-bold text-sm tracking-wide">{user?.fullName}</div>
          </div>
          <div className="flex flex-col sm:text-right">
            <label className="label uppercase !text-[10px] opacity-50 font-bold text-gray-500">Assigned Pen</label>
            <div className="font-bold text-sm tracking-wide text-[var(--customRedColor)]">{user?.penHouse || "No Pen Assigned"}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="label text-sm mb-1">Bird Class (Livestock)</label>
            <div className="relative">
              <div
                onClick={() => toggleBirdClass((prev) => !prev)}
                className={`form-input cursor-pointer flex justify-between items-center ${consumptionForm.birdClass ? 'bg-[var(--primary)] pointer-events-none opacity-80' : ''}`}
              >
                {consumptionForm.birdClass ? consumptionForm.birdClass : 'Select Bird Class'}
                {!consumptionForm.birdClass && (
                  <i className={`bi bi-caret-down-fill ml-auto ${isBirdClass ? 'rotate-180 transition-transform' : ''}`}></i>
                )}
              </div>
              {isBirdClass && !consumptionForm.birdClass && (
                <div className="dropdownList absolute left-0 right-0 mt-1 z-10 bg-white border border-[var(--border)] rounded shadow-lg max-h-[200px] overflow-y-auto">
                  {buyingProducts
                    .filter((item) => item.type === 'Livestock')
                    .map((item, index) => (
                      <div
                        onClick={() => selectBirdClass(item)}
                        key={index}
                        className="p-3 cursor-pointer border-b border-b-[var(--border)] hover:bg-[var(--primary)]"
                      >
                        {item.name}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="label text-sm mb-1">Weight</label>
            <input
              className="form-input"
              name="weight"
              value={consumptionForm.weight}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter weight"
            />
          </div>

          <div className="flex flex-col border-b border-[var(--border)] sm:border-0 pb-2 sm:pb-0">
            <label className="label text-sm opacity-70 mb-1">Number of Birds</label>
            <div className="form-input bg-gray-50 border-gray-200 pointer-events-none opacity-80 h-[45px] flex items-center">
              {consumptionForm.birds || 0}
            </div>
          </div>
          <div className="flex flex-col text-right border-b border-[var(--border)] sm:border-0 pb-2 sm:pb-0">
            <label className="label text-sm opacity-70 mb-1">Livestock Age</label>
            <div className="form-input bg-gray-50 border-gray-200 pointer-events-none opacity-80 h-[45px] flex items-center justify-end">
              {consumptionForm.birdAge || 'N/A'}
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-4 pt-4 border-t border-[var(--border)]">
          <label className="label font-bold text-[var(--customRedColor)] text-sm mb-2 text-center w-full">Select Consumption Category</label>
          <div className="flex w-full gap-2 mb-4 justify-center">
            {['Feed', 'Medicine', 'Water'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat as any)}
                className={`flex-1 py-2.5 text-xs font-bold rounded transition-all border ${activeCategory === cat ? 'bg-[var(--customColor)] text-white border-[var(--customColor)] shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="label font-bold text-[var(--customRedColor)] text-sm mb-1">Consumption Product ({activeCategory})</label>
            <div className="relative">
              <div
                onClick={() => toggleFeed((prev) => !prev)}
                className="form-input cursor-pointer border-[var(--customRedColor)] flex justify-between items-center"
              >
                {consumptionForm.feed ? consumptionForm.feed : `Select ${activeCategory}...`}
                <i className={`bi bi-caret-down-fill ml-auto ${isFeed ? 'rotate-180 transition-transform' : ''}`}></i>
              </div>
              {isFeed && (
                <div className="dropdownList absolute left-0 right-0 mt-1 z-[60] bg-white border border-[var(--border)] rounded shadow-lg max-h-[200px] overflow-y-auto">
                  {buyingProducts
                    .filter((item) => item.type === activeCategory)
                    .map((item, index) => (
                      <div
                        onClick={() => selectFeed(item)}
                        key={index}
                        className="p-3 cursor-pointer border-b border-b-[var(--border)] hover:bg-[var(--primary)] text-sm"
                      >
                        {item.name}
                      </div>
                    ))}
                  {buyingProducts.filter((item) => item.type === activeCategory).length === 0 && (
                    <div className="p-3 text-xs opacity-50 text-center italic">No {activeCategory} products found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="label text-sm mb-1">
              Quantity Used ({consumptionForm.consumptionUnit || "Units"})
            </label>
            <input
              className="form-input"
              name="consumption"
              value={consumptionForm.consumption}
              onChange={handleInputChange}
              type="number"
              placeholder="0"
            />
          </div>

          <div className="flex flex-col col-span-2 mt-2">
            <label className="label text-sm mb-1">Remark / Observation</label>
            <input
              placeholder="Enter remark or observation..."
              className="form-input"
              name="remark"
              type="text"
              value={consumptionForm.remark ?? ''}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Batch Records Display */}
        {pendingConsumptions.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <label className="label mb-3 text-xs opacity-70 font-bold uppercase tracking-wider text-gray-500">Batch Queue ({pendingConsumptions.length} records ready)</label>
            <div className="flex flex-wrap gap-2">
              {pendingConsumptions.map((item, index) => (
                <div key={index} className="relative group">
                  <button
                    onClick={() => handleEditRecord(index)}
                    className={`px-3 py-1.5 text-xs rounded border transition-all flex items-center gap-2 group-hover:pr-7 ${editingPendingIndex === index
                        ? 'bg-[var(--customColor)] text-white border-[var(--customColor)] shadow-sm'
                        : 'bg-gray-100 border-gray-200 hover:border-[var(--customColor)]'
                      }`}
                  >
                    <span className="opacity-70 font-mono">#{index + 1}</span>
                    <span className="font-bold">{item.feed}</span>
                    <span className="opacity-70">({item.consumption} {item.consumptionUnit})</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removePendingConsumption(index)
                      if (editingPendingIndex === index) resetForm()
                    }}
                    className="absolute top-1/2 -right-1 -translate-y-1/2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm hover:bg-black transition-all opacity-0 group-hover:opacity-100 group-hover:right-1"
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="table-action gap-3 mt-8 flex flex-wrap justify-end border-t pt-5">
          {loading ? (
            <button className="custom_btn bg-gray-400 cursor-not-allowed">
              <i className="bi bi-opencollective loading mr-2"></i>
              Processing...
            </button>
          ) : (
            <>
              <button
                className="custom_btn bg-green-600 !text-white flex items-center shadow-sm hover:bg-green-700 transition-colors"
                onClick={handleAddMore}
                disabled={!consumptionForm.feedId && editingPendingIndex === null}
              >
                <i className={`bi ${editingPendingIndex !== null ? 'bi-check-circle' : 'bi-plus-circle'} mr-2`}></i>
                {editingPendingIndex !== null ? 'Update Item' : 'Add to Batch'}
              </button>

              {editingPendingIndex !== null && (
                <button className="custom_btn bg-gray-400 !text-white hover:bg-gray-500 transition-colors" onClick={() => resetForm()}>
                  Cancel
                </button>
              )}

              <button
                className="custom_btn bg-[var(--customColor)] flex items-center shadow-sm hover:opacity-90 transition-opacity"
                onClick={handleSubmit}
                disabled={!consumptionForm.feedId && pendingConsumptions.length === 0}
              >
                <i className="bi bi-send-fill mr-2"></i>
                {consumptionForm._id ? 'Update Final Record' : `Submit Batch (${pendingConsumptions.length + (consumptionForm.feedId && editingPendingIndex === null ? 1 : 0)})`}
              </button>

              <button
                className="custom_btn border border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  setShowConsumptionForm(false)
                  resetForm()
                  clearPendingConsumptions()
                }}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConsumptionForm
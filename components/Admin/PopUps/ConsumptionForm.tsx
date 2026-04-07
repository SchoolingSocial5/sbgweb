'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import ConsumptionStore from '@/src/zustand/Consumption'
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
  } = ConsumptionStore()
  const { buyingProducts } = ProductStore()
  const { pens, getPens } = PenStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const [isFeed, toggleFeed] = useState(false)
  const [isBirdClass, toggleBirdClass] = useState(false)
  const url = `/consumptions`

  useEffect(() => {
    reshuffleResults()
    getPens('/pens?page_size=100&page=1', setMessage)
  }, [pathname, reshuffleResults])

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
    ConsumptionStore.setState((prev) => {
      return {
        consumptionForm: {
          ...prev.consumptionForm,
          feed: feed.name,
          feedId: feed._id,
          consumptionUnit: feed.purchaseUnit,
        },
      }
    })
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

    ConsumptionStore.setState((prev) => {
      return {
        consumptionForm: {
          ...prev.consumptionForm,
          birdClass: bird.name,
          birds: unitsInPen,
          birdAge: age
        },
      }
    })
    toggleBirdClass(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof consumptionForm, value)
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
        name: 'feedId',
        value: consumptionForm.feedId,
        rules: { blank: false },
        field: 'Feed field',
      },
      {
        name: 'birds',
        value: consumptionForm.birds,
        rules: { blank: false },
        field: 'Birds field',
      },
      {
        name: 'consumption',
        value: consumptionForm.consumption,
        rules: { blank: false },
        field: 'Consumption field',
      },
      {
        name: 'birdAge',
        value: consumptionForm.birdAge,
        rules: { blank: false },
        field: 'Bird age field',
      },
      {
        name: 'birdClass',
        value: consumptionForm.birdClass,
        rules: { blank: false },
        field: 'Bird class field',
      },
      {
        name: 'feed',
        value: consumptionForm.feed,
        rules: { blank: false },
        field: 'Feed field',
      },
      {
        name: 'consumptionUnit',
        value: consumptionForm.consumptionUnit,
        rules: { blank: false },
        field: 'Consumption unit field',
      },
      {
        name: 'weight',
        value: consumptionForm.weight,
        rules: { blank: false },
        field: 'Weight field',
      },

      {
        name: 'remark',
        value: consumptionForm.remark,
        rules: { blank: false, maxLength: 20000 },
        field: 'Remark field',
      },
      {
        name: 'pen',
        value: user?.penHouse || "",
        rules: { blank: false, maxLength: 100 },
        field: 'Pen field',
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
      'Are you sure you want to submit this consumption record',
      true,
      () =>
        consumptionForm._id
          ? updateConsumption(
            `/consumptions/${consumptionForm._id}/?ordering=-createdAt`,
            data,
            setMessage,
            () => {
              setShowConsumptionForm(false)
              resetForm()
            }
          )
          : postConsumption(
            `${url}?ordering=-createdAt`,
            data,
            setMessage,
            () => {
              setShowConsumptionForm(false)
              resetForm()
            }
          )
    )
  }

  return (
    <>
      <div
        onClick={() => setShowConsumptionForm(false)}
        className="fixed h-full w-full z-50 left-0 top-0 bg-black/50 items-center justify-center flex"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="card_body sharp w-full max-w-[800px] max-h-[100vh] overflow-auto"
        >
          <div className="grid sm:grid-cols-2 gap-4 mb-4 pb-4 border-b border-[var(--border)]">
            <div className="flex flex-col">
              <label className="label uppercase !text-[10px] opacity-50 font-bold">Staff</label>
              <div className="font-bold text-sm tracking-wide">{user?.fullName}</div>
            </div>
            <div className="flex flex-col sm:text-right">
              <label className="label uppercase !text-[10px] opacity-50 font-bold">Assigned Pen</label>
              <div className="font-bold text-sm tracking-wide text-[var(--customRedColor)]">{user?.penHouse || "No Pen Assigned"}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Bird Class (Livestock)
              </label>
              <div className="relative">
                <div
                  onClick={() => toggleBirdClass((e) => !e)}
                  className={`form-input cursor-pointer ${consumptionForm.birdClass ? 'bg-[var(--primary)] pointer-events-none opacity-80' : ''}`}
                >
                  {consumptionForm.birdClass ? consumptionForm.birdClass : 'Select Bird Class'}
                  {!consumptionForm.birdClass && (
                    <i
                      className={`bi bi-caret-down-fill ml-auto ${isBirdClass ? 'active' : ''
                        }`}
                    ></i>
                  )}
                </div>
                {isBirdClass && !consumptionForm.birdClass && (
                  <div className="dropdownList">
                    {buyingProducts
                      .filter((item) => item.type === 'Livestock')
                      .map((item, index) => (
                        <div
                          onClick={() => selectBirdClass(item)}
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
                Birds (Quantity in Pen)
              </label>
              <input
                className="form-input bg-[var(--primary)] pointer-events-none opacity-80"
                name="birds"
                value={consumptionForm.birds}
                onChange={handleInputChange}
                type="number"
                placeholder="Automated Birds"
                readOnly
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Bird Age
              </label>
              <input
                className="form-input bg-[var(--primary)] pointer-events-none opacity-80"
                name="birdAge"
                value={consumptionForm.birdAge}
                onChange={handleInputChange}
                type="text"
                placeholder="Automated Age"
                readOnly
              />
            </div>
            
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Weight
              </label>
              <input
                className="form-input"
                name="weight"
                value={consumptionForm.weight}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter weight"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Consumption Product
              </label>
              <div className="relative">
                <div
                  onClick={() => toggleFeed((e) => !e)}
                  className="form-input cursor-pointer"
                >
                  {consumptionForm.feed ? consumptionForm.feed : 'Select Consumption'}
                  <i
                    className={`bi bi-caret-down-fill ml-auto ${isFeed ? 'active' : ''
                      }`}
                  ></i>
                </div>
                {isFeed && (
                  <div className="dropdownList">
                    {buyingProducts
                      .filter((item) => ['Feed', 'Medicine', 'Water'].includes(item.type))
                      .map((item, index) => (
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
                Consumption Quantity ({consumptionForm.consumptionUnit || "Units"})
              </label>
              <input
                className="form-input"
                name="consumption"
                value={consumptionForm.consumption}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter quantity"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Consumption Remark
            </label>
            <input
              placeholder="Write the remark/observation of the consumption"
              className="form-input"
              name="remark"
              type="text"
              value={consumptionForm.remark}
              onChange={handleInputChange}
            />
          </div>

          <div className="table-action gap-3 mt-3 flex flex-wrap">
            {loading ? (
              <button className="custom_btn">
                <i className="bi bi-opencollective loading"></i>
                Processing...
              </button>
            ) : (
              <>
                <button className="custom_btn" onClick={handleSubmit}>
                  Submit
                </button>

                <button
                  className="custom_btn danger ml-auto"
                  onClick={() => setShowConsumptionForm(false)}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ConsumptionForm
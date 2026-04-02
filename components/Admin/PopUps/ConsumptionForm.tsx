'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import ConsumptionStore from '@/src/zustand/Consumption'
import ProductStore, { Product } from '@/src/zustand/Product'

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
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const [isFeed, toggleFeed] = useState(false)
  const url = `/consumptions`

  useEffect(() => {
    reshuffleResults()
  }, [pathname, reshuffleResults])

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
        rules: { blank: true },
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
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Birds
              </label>
              <input
                className="form-input"
                name="birds"
                value={consumptionForm.birds}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter number of birds"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Bird Age
              </label>
              <input
                className="form-input"
                name="birdAge"
                value={consumptionForm.birdAge}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter bird age"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Bird Class
              </label>
              <input
                className="form-input"
                name="birdClass"
                value={consumptionForm.birdClass}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter bird class"
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
                    {buyingProducts.map((item, index) => (
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
                Consumption
              </label>
              <input
                className="form-input"
                name="consumption"
                value={consumptionForm.consumption}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter consumption"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Staff
              </label>
              <div className="form-input bg-[var(--primary)] pointer-events-none opacity-80">{user?.fullName}</div>
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Pen
              </label>
              <div className="form-input bg-[var(--primary)] pointer-events-none opacity-80">{user?.penHouse || "No Pen Assigned"}</div>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Consumption Remark
            </label>
            <textarea
              placeholder="Write the remark/observation of the consumption"
              className="form-input"
              name="remark"
              value={consumptionForm.remark}
              onChange={handleInputChange}
            ></textarea>
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
'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import OperationStore from '@/src/zustand/Operation'

const OperationOverlay: React.FC = () => {
  const {
    operationForm,
    loading,
    updateOperation,
    createOperation,
    setForm,
    resetForm,
    setShowOperationForm,
    reshuffleResults,
  } = OperationStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const url = `/consumptions`

  useEffect(() => {
    reshuffleResults()
  }, [pathname])


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof operationForm, value)
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
        name: 'livestock',
        value: operationForm.livestock,
        rules: { blank: false },
        field: 'Live Stock field',
      },
      {
        name: 'livestockAge',
        value: operationForm.livestockAge,
        rules: { blank: true },
        field: 'Livestock Age',
      },
      {
        name: 'operation',
        value: operationForm.operation,
        rules: { blank: false },
        field: 'Livestock Operation field',
      },
      {
        name: 'livestockNumber',
        value: operationForm.livestockNumber,
        rules: { blank: false },
        field: 'Number field',
      },
      {
        name: 'medication',
        value: operationForm.medication,
        rules: { blank: false },
        field: 'Medication field',
      },
      {
        name: 'quantity',
        value: operationForm.quantity,
        rules: { blank: false },
        field: 'Quantity field',
      },
      {
        name: 'weight',
        value: operationForm.weight,
        rules: { blank: false },
        field: 'Weight field',
      },

      {
        name: 'remark',
        value: operationForm.remark,
        rules: { blank: false, maxLength: 10 },
        field: 'Remark field',
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
        operationForm._id
          ? updateOperation(
            `/consumptions/${operationForm._id}/?ordering=-createdAt`,
            data,
            setMessage,
            () => {
              setShowOperationForm(false)
              resetForm()
            }
          )
          : createOperation(
            `${url}?ordering=-createdAt`,
            data,
            setMessage,
            () => {
              setShowOperationForm(false)
              resetForm()
            }
          )
    )
  }

  return (
    <>
      <div
        onClick={() => setShowOperationForm(false)}
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
                Operation
              </label>
              <input
                className="form-input"
                name="operation"
                value={operationForm.operation}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter operation"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Live Stock
              </label>
              <input
                className="form-input"
                name="livestock"
                value={operationForm.livestock}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter number of livestock"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Livestock Age
              </label>
              <input
                className="form-input"
                name="livestockAge"
                value={operationForm.livestockAge}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter livestock age"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Livestock Number
              </label>
              <input
                className="form-input"
                name="livestockNumber"
                value={operationForm.livestockNumber}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter livestock number"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Weight
              </label>
              <input
                className="form-input"
                name="weight"
                value={operationForm.weight}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter weight"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Medication
              </label>
              <input
                className="form-input"
                name="medication"
                value={operationForm.medication}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter medication"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Quantity
              </label>
              <input
                className="form-input"
                name="quantity"
                value={operationForm.quantity}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter quantity"
              />
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
              value={operationForm.remark}
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
                  onClick={() => setShowOperationForm(false)}
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

export default OperationOverlay

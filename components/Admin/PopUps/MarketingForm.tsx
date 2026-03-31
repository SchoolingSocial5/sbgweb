'use client'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import MarketingStore from '@/src/zustand/Marketing'

const MarketingForm: React.FC = () => {
  const {
    marketingForm,
    loading,
    updateMarketing,
    postMarketing,
    setForm,
    resetForm,
    setShowMarketingForm,
  } = MarketingStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const url = `/marketing`

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof marketingForm, value)
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
        name: 'customerName',
        value: marketingForm.customerName,
        rules: { blank: false },
        field: 'Name type field',
      },
      {
        name: 'customerAddress',
        value: marketingForm.customerAddress,
        rules: { blank: false },
        field: 'Address field',
      },
      {
        name: 'customerPhone',
        value: marketingForm.customerPhone,
        rules: { blank: true },
        field: 'Phone field',
      },
      {
        name: 'username',
        value: marketingForm.username,
        rules: { blank: false },
        field: 'Username field',
      },

      {
        name: 'email',
        value: marketingForm.email,
        rules: { blank: false },
        field: 'Like field',
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
        marketingForm._id
          ? updateMarketing(
              `/marketing/${marketingForm._id}/?ordering=-createdAt`,
              data,
              setMessage,
              () => {
                setShowMarketingForm(false)
                resetForm()
              }
            )
          : postMarketing(
              `${url}?ordering=-createdAt`,
              data,
              setMessage,
              () => {
                setShowMarketingForm(false)
                resetForm()
              }
            )
    )
  }

  return (
    <>
      <div
        onClick={() => setShowMarketingForm(false)}
        className="fixed h-full w-full z-30 left-0 top-0 bg-black/50 items-center justify-center flex"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="card_body sharp w-full max-w-[800px]"
        >
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Customer Name
              </label>
              <input
                className="form-input"
                name="customerName"
                value={marketingForm.customerName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter customer name"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Customer Address
              </label>
              <input
                className="form-input"
                name="customerAddress"
                value={marketingForm.customerAddress}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter customer address"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Customer Phone
              </label>
              <input
                className="form-input"
                name="customerPhone"
                value={marketingForm.customerPhone}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter customer phone"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Customer Email
              </label>
              <input
                className="form-input"
                name="email"
                value={marketingForm.email}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter email"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Customer Username
              </label>
              <input
                className="form-input"
                name="username"
                value={marketingForm.username}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter username"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Staff
              </label>
              <div className="form-input">{user?.fullName}</div>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Remark
            </label>
            <textarea
              placeholder="Write your marketing remark"
              className="form-input"
              name="remark"
              value={marketingForm.remark}
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
                  onClick={() => setShowMarketingForm(false)}
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

export default MarketingForm

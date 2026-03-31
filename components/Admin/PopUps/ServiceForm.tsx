'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import ServiceStore from '@/src/zustand/Service'

const ServiceForm: React.FC = () => {
  const {
    serviceForm,
    loading,
    updateService,
    postService,
    setForm,
    resetForm,
    setShowServiceForm,
    reshuffleResults,
  } = ServiceStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const url = `/services`

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof serviceForm, value)
  }

  const handleFileChange =
    (key: keyof typeof serviceForm) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null
        setForm(key, file)
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
        name: 'title',
        value: serviceForm.title,
        rules: { blank: true },
        field: 'Name field',
      },
      {
        name: 'clientName',
        value: serviceForm.clientName,
        rules: { blank: false },
        field: 'Name field',
      },
      {
        name: 'warranty',
        value: serviceForm.warranty,
        rules: { blank: false },
        field: 'Name field',
      },
      {
        name: 'clientPhone',
        value: serviceForm.clientPhone,
        rules: { blank: false },
        field: 'Name field',
      },
      {
        name: 'clientAddress',
        value: serviceForm.clientAddress,
        rules: { blank: false },
        field: 'Name field',
      },
      {
        name: 'amount',
        value: serviceForm.amount,
        rules: { blank: false },
        field: 'Name field',
      },
      {
        name: 'video',
        value: serviceForm.video,
        rules: { blank: false },
        field: 'Video field',
      },
      {
        name: 'receipt',
        value: serviceForm.receipt,
        rules: { blank: false },
        field: 'Receipt field',
      },
      {
        name: 'description',
        value: serviceForm.description,
        rules: { blank: true, minLength: 10 },
        field: 'Amount field',
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
      'Are you sure you want to submit this service record',
      true,
      () =>
        serviceForm._id
          ? updateService(
            `/services/${serviceForm._id}/?ordering=-createdAt`,
            data,
            setMessage,
            () => {
              setShowServiceForm(false)
              resetForm()
            }
          )
          : postService(`${url}?ordering=-createdAt`, data, setMessage, () => {
            setShowServiceForm(false)
            resetForm()
          })
    )
  }

  return (
    <>
      <div
        onClick={() => setShowServiceForm(false)}
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
                Service Title
              </label>
              <input
                className="form-input"
                name="title"
                value={serviceForm.title}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter service title"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Vendor Name
              </label>
              <input
                className="form-input"
                name="clientName"
                value={serviceForm.clientName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter client name"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Vendor Phone
              </label>
              <input
                className="form-input"
                name="clientPhone"
                value={serviceForm.clientPhone}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter client phone"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Vendor Address
              </label>
              <input
                className="form-input"
                name="clientAddress"
                value={serviceForm.clientAddress}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter vendor address"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Vendor Warranty
              </label>
              <input
                className="form-input"
                name="warranty"
                value={serviceForm.warranty}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter vendor address"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Bill
              </label>
              <input
                className="form-input"
                name="amount"
                value={serviceForm.amount}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter bill"
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
              Service Remark
            </label>
            <textarea
              placeholder="Write the remark/observation of the service"
              className="form-input"
              name="description"
              value={serviceForm.description}
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
                <label htmlFor="receipt" className="custom_btn ">
                  <input
                    className="input-file"
                    type="file"
                    name="receipt"
                    id="receipt"
                    accept="image/*"
                    onChange={handleFileChange('receipt')}
                  />
                  <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                  Receipt
                </label>
                <label htmlFor="video" className="custom_btn ">
                  <input
                    className="input-file"
                    type="file"
                    name="video"
                    id="video"
                    accept="video/*"
                    onChange={handleFileChange('video')}
                  />
                  <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                  Video
                </label>

                <button
                  className="custom_btn danger ml-auto"
                  onClick={() => setShowServiceForm(false)}
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

export default ServiceForm

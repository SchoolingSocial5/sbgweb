'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import CompanyStore from '@/src/zustand/app/Company'

const CreateCompany: React.FC = () => {
  const url = '/company/'
  const { companyForm, loading, setForm, resetAll, updateItem } = CompanyStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof companyForm, value)
  }

  const startReset = () => {
    setAlert(
      'Warning',
      'Are you sure you want to clear and reset every activities?',
      true,
      () => resetAll("/company/reset", { reset: "" }, setMessage)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'id',
        value: companyForm._id,
        rules: { blank: false, maxLength: 100 },
        field: 'Email field',
      },
      {
        name: 'email',
        value: companyForm.email,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Email field',
      },
      {
        name: 'name',
        value: companyForm.name,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Name field',
      },
      {
        name: 'finalInstruction',
        value: companyForm.finalInstruction,
        rules: { blank: true, minLength: 3, },
        field: 'Company Info',
      },
      {
        name: 'headquaters',
        value: companyForm.headquaters,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Headquaters field',
      },
      {
        name: 'phone',
        value: companyForm.phone,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Phone Id',
      },
      {
        name: 'allowApplicant',
        value: companyForm.allowApplicant,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Allow Applicant',
      },
      {
        name: 'domain',
        value: companyForm.domain,
        rules: { blank: false, maxLength: 1000 },
        field: 'Domain field',
      },
      {
        name: 'bankName',
        value: companyForm.bankName,
        rules: { blank: false, maxLength: 1000 },
        field: 'Bank field',
      },
      {
        name: 'bankAccountName',
        value: companyForm.bankAccountName,
        rules: { blank: false, maxLength: 1000 },
        field: 'Bank account name field',
      },
      {
        name: 'bankAccountNumber',
        value: companyForm.bankAccountNumber,
        rules: { blank: false, maxLength: 1000 },
        field: 'Bank account number field',
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
    e.preventDefault()
    const data = appendForm(inputsToValidate)
    updateItem(`${url}`, data, setMessage)
  }

  return (
    <>

      <div className="card_body sharp h-full">
        <div className="custom_sm_title">Update Company</div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Name
            </label>
            <input
              className="form-input"
              name="name"
              value={companyForm.name}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter name"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Domain
            </label>
            <input
              className="form-input"
              name="domain"
              value={companyForm.domain}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter domain"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Email
            </label>
            <input
              className="form-input"
              name="email"
              value={companyForm.email}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter email"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Phone
            </label>
            <input
              className="form-input"
              name="phone"
              value={companyForm.phone}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter phone"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Headquaters
            </label>
            <input
              className="form-input"
              name="headquaters"
              value={companyForm.headquaters}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter headquaters"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Bank Name
            </label>
            <input
              className="form-input"
              name="bankName"
              value={companyForm.bankName}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter bank account number"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Account Number
            </label>
            <input
              className="form-input"
              name="bankAccountNumber"
              value={companyForm.bankAccountNumber}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter bank account number"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Bank Account Name
            </label>
            <input
              className="form-input"
              name="bankAccountName"
              value={companyForm.bankAccountName}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter bank account name"
            />
          </div>
        </div>

        <div className="flex flex-col mb-2">
          <label className="label" htmlFor="">
            Brief Company Info
          </label>
          <textarea
            value={companyForm.finalInstruction}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Write welcome note"
            name="finalInstruction"
            id=""
          ></textarea>
        </div>

        <div className="table-action flex flex-wrap gap-3">
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
              <button className="custom_btn" onClick={startReset}>
                Reset App
              </button>
              <button
                type="button"
                onClick={() => setForm("allowApplicant", !companyForm.allowApplicant)}
                className={`relative w-10 h-5 rounded-full transition-all border border-border-custom cursor-pointer ${companyForm.allowApplicant ? 'bg-[var(--customColor)]' : 'bg-secondary-bg '}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm ${companyForm.allowApplicant ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <Link href="/admin/company/staffs" className="custom_btn ml-auto">
                Staff Table
              </Link>

              {/* <Link href="/admin/company/barcode" className="custom_btn ml-2">
                Bar Code
              </Link> */}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateCompany

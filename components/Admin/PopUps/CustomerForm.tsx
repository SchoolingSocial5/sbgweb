'use client'
import { UserStore } from '@/src/zustand/user/User'

const CustomerForm: React.FC = () => {
  const { userForm, loading, setForm, setShowUserForm } = UserStore()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof userForm, value)
  }

  return (
    <>
      <div
        onClick={() => setShowUserForm(false)}
        className="fixed h-full w-full z-40 left-0 top-0 bg-black/50 items-center justify-center flex"
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
                Full Name
              </label>
              <input
                className="form-input"
                name="fullName"
                value={userForm.fullName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter user full name"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Email
              </label>
              <input
                className="form-input"
                name="email"
                value={userForm.email}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter user email"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Phone
              </label>
              <input
                className="form-input"
                name="phone"
                value={userForm.phone}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter user phone"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Address
              </label>
              <input
                className="form-input"
                name="address"
                value={userForm.address}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter user address"
              />
            </div>
          </div>

          <div className="table-action mt-3 flex flex-wrap">
            {loading ? (
              <button className="custom_btn">
                <i className="bi bi-opencollective loading"></i>
                Processing...
              </button>
            ) : (
              <>
                <button
                  className="custom_btn mr-3"
                  onClick={() => setShowUserForm(false)}
                >
                  Submit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CustomerForm

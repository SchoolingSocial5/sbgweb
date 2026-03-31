'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import PictureDisplay from '@/components/PictureDisplay'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { UserStore } from '@/src/zustand/user/User'

const StaffSheet: React.FC = () => {
  const {
    userForm,
    loading, reshuffleResults,
    updateStaff,
    setForm,
    setShowProfileSheet,
  } = UserStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const url = '/users/staff'

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof userForm, value)
  }

  const handleSubmit = async () => {
    if (!user) {
      setMessage('Please login to continue', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'username',
        value: userForm.username,
        rules: { blank: true, minLength: 1, maxLength: 100 },
        field: 'Username field',
      },
      {
        name: 'salary',
        value: userForm.salary,
        rules: { blank: true, minLength: 1, maxLength: 100 },
        field: 'Salary field',
      },
      {
        name: 'staffRanking',
        value: userForm.staffRanking,
        rules: { blank: true, minLength: 1, maxLength: 100 },
        field: 'Amount field',
      },
      {
        name: 'staffPositions',
        value: userForm.staffPositions,
        rules: { blank: true, maxLength: 1000 },
        field: 'Position field',
      },
      {
        name: 'roles',
        value: userForm.roles,
        rules: { blank: true, maxLength: 1000 },
        field: 'Role field',
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
      'Are you sure you want to update this staff record',
      true,
      () =>
        updateStaff(
          `${url}/?ordering=-staffRanking&status=Staff`,
          data,
          setMessage,
          () => setShowProfileSheet(false)
        )
    )
  }

  return (
    <>
      <div
        onClick={() => setShowProfileSheet(false)}
        className="fixed h-full w-full z-30 left-0 top-0 bg-black/50 items-center justify-center flex"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="card_body sharp w-full max-w-[600px]"
        >
          <div className="flex w-full justify-center">
            <div className="relative my-5 w-full max-w-[200px] h-[150px] rounded-xl  overflow-hidden">
              {userForm?.picture ? (
                <PictureDisplay source={String(userForm.picture)} />
              ) : (
                <div className="bg-[var(--secondary)] h-full w-full" />
              )}
            </div>
          </div>
          <div className="custom_sm_title text-center">{userForm.fullName}</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Ranking
              </label>
              <input
                className="form-input"
                name="staffRanking"
                value={userForm.staffRanking}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter rank"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Salary
              </label>
              <input
                className="form-input"
                name="salary"
                value={userForm.salary}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter salary"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Position
              </label>
              <input
                className="form-input"
                name="staffPositions"
                value={userForm.staffPositions}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter position"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Roles
              </label>
              <input
                className="form-input"
                name="roles"
                value={userForm.roles}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter roles"
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
                  onClick={() => handleSubmit()}
                >
                  Submit
                </button>

                <button
                  className="custom_btn danger ml-auto"
                  onClick={() => setShowProfileSheet(false)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default StaffSheet

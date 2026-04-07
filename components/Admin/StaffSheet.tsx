'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import PictureDisplay from '@/components/PictureDisplay'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { UserStore } from '@/src/zustand/user/User'
import PositionStore, { Position } from '@/src/zustand/app/Position'
import PenStore from '@/src/zustand/Pen'

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
  const { positionResults, getPositions } = PositionStore()
  const { pens, getPens } = PenStore()
  const [isPos, togglePos] = useState(false)
  const url = '/users/staff'

  useEffect(() => {
    reshuffleResults()
    getPositions('/company/positions?page_size=100&page=1', setMessage)
    getPens('/pens?page_size=100&page=1', setMessage)
  }, [pathname, reshuffleResults, getPositions, getPens, setMessage])

  const selectPosition = (p: Position) => {
    setForm('staffPositions', p.position)
    setForm('salary', p.salary)
    setForm('roles', p.role)
    togglePos(false)
  }

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
        name: 'penHouse',
        value: userForm.penHouse,
        rules: { blank: false, maxLength: 100 },
        field: 'Pen House field',
      },
      {
        name: 'salary',
        value: userForm.salary,
        rules: { blank: true, minLength: 1, maxLength: 100 },
        field: 'Salary field',
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
          `${url}/?ordering=-office&status=Staff`,
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
        className="fixed h-full w-full z-50 left-0 top-0 bg-black/50 items-center justify-center flex"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="card_body sharp w-full max-w-[600px] max-h-[90vh] overflow-y-auto"
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
                Salary
              </label>
              <input
                className="form-input"
                name="salary"
                value={userForm.salary || 0}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter salary"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Assigned Pen
              </label>
              <select 
                className="form-input"
                name="penHouse"
                value={userForm.penHouse || ""}
                onChange={(e) => setForm('penHouse', e.target.value)}
              >
                <option value="">-- No Pen --</option>
                {pens.map((p, idx) => (
                  <option key={idx} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Position
              </label>
              <div className="relative">
                <div
                  onClick={() => togglePos((e) => !e)}
                  className="form-input cursor-pointer flex items-center"
                >
                  {userForm.staffPositions ? userForm.staffPositions : 'Select Position'}
                  <i
                    className={`bi bi-caret-down-fill ml-auto ${isPos ? 'active' : ''
                      }`}
                  ></i>
                </div>
                {isPos && (
                  <div className="dropdownList z-[60] absolute top-full left-0 w-full max-h-[200px] overflow-auto bg-[var(--primary)] border border-border-custom shadow-lg">
                    {positionResults.map((item, index) => (
                      <div
                        onClick={() => selectPosition(item)}
                        key={index}
                        className="p-3 cursor-pointer border-b border-b-[var(--border)] hover:bg-[var(--secondary)]"
                      >
                        {item.position}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col col-span-2">
              <label className="label" htmlFor="">
                Roles
              </label>
              <input
                className="form-input"
                name="roles"
                value={userForm.roles || ''}
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

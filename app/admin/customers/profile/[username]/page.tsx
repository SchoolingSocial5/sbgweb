'use client'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useEffect } from 'react'
import PictureDisplay from '@/components/PictureDisplay'
import { UserStore } from '@/src/zustand/user/User'
import { useParams } from 'next/navigation'
import UserTransactions from '@/components/Admin/Transaction/UserTransactions'

const BasicSettings: React.FC = () => {
  const { username } = useParams()
  const { userForm, getUser, updateUser } = UserStore()
  const { setMessage } = MessageStore()

  useEffect(() => {
    if (username) {
      getUser(`/users/${username}`, setMessage)
    }
  }, [username])

  const togglePartPayment = () => {
    updateUser(`/users/${username}`, { isPartPayment: !userForm.isPartPayment }, setMessage)
  }

  return (
    <>
      <div className="card_body sharp h-full mb-10">
        <div className="custom_sm_title">{userForm.fullName} Profile</div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col relative">
            <div className="relative my-5 w-full max-w-[200px] h-[150px]">
              <div className="relative w-full max-w-[200px] h-[150px] rounded-xl  overflow-hidden">
                {userForm?.picture ? (
                  <PictureDisplay source={String(userForm.picture)} />
                ) : (
                  <PictureDisplay source={'/images/avatar.jpg'} />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-3">
              <label className="label" htmlFor="">
                Email
              </label>
              <div className="form-input">{userForm.email}</div>
            </div>
            <div className="mb-3">
              <label className="label" htmlFor="">
                Full Name
              </label>
              <div className="form-input">{userForm.fullName}</div>


              <div className="mb-3">
                <label className="label" htmlFor="">
                  Phone Number
                </label>
                <div className="form-input">{userForm.phone}</div>
              </div>

              <div className="flex flex-col">
                <label className="label mb-3" htmlFor="">
                  Allow Part Payment
                </label>
                <button
                  onClick={() => togglePartPayment()}
                  className={`switch_btn mr-auto ${userForm.isPartPayment ? 'active' : ''
                    }`}
                  aria-label="Toggle Job Posting"
                >
                  <div
                    className={`switch_ball ${userForm.isPartPayment ? 'active' : ''
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserTransactions />
    </>
  )
}

export default BasicSettings

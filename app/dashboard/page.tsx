'use client'
import UserReview from '@/components/Dashboard/UserReview'
import PictureDisplay from '@/components/PictureDisplay'
import { AuthStore } from '@/src/zustand/user/AuthStore'

const Dashboard: React.FC = () => {
  const { user } = AuthStore()

  return (
    <>
      <div className="card_body sharp h-full mb-10">
        <div className="custom_sm_title">{user?.fullName} Profile</div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col relative">
            <div className="relative my-5 w-full max-w-[200px] h-[150px]">
              <div className="relative w-full max-w-[200px] h-[150px] rounded-xl  overflow-hidden">
                {user?.picture ? (
                  <PictureDisplay source={String(user?.picture)} />
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
              <div className="form-input">{user?.email}</div>
            </div>
            <div className="mb-3">
              <label className="label" htmlFor="">
                Full Name
              </label>
              <div className="form-input">{user?.fullName}</div>

              <div className="mb-3">
                <label className="label" htmlFor="">
                  Phone Number
                </label>
                <div className="form-input">{user?.phone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserReview />
    </>
  )
}

export default Dashboard

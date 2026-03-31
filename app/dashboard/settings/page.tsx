'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useEffect, useState } from 'react'
import PictureDisplay from '@/components/PictureDisplay'
import { UserStore } from '@/src/zustand/user/User'
import { AuthStore } from '@/src/zustand/user/AuthStore'

const BasicSettings: React.FC = () => {
  const url = '/users'
  const {
    userForm,
    loading,
    autLoading, setForm,
    getUser,
    updateMyUser,
    updateAuthUser,
  } = UserStore()
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (user) {
      getUser(`/users/${user.username}`, setMessage)
    }
  }, [user])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof userForm, value)
  }

  const toggleTwoFactor = () => {
    UserStore.setState((prev) => {
      return {
        userForm: { ...prev.userForm, isTwoFactor: !prev.userForm.isTwoFactor },
      }
    })
  }

  const handleFileChange =
    (key: keyof typeof userForm) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null
        if (key === 'picture' && file) {
          setForm(key, file)
          const localUrl = URL.createObjectURL(file)
          setPreview(localUrl)
        }
      }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'fullName',
        value: userForm.fullName,
        rules: { blank: false, maxLength: 100 },
        field: 'Full name field',
      },
      {
        name: 'phone',
        value: userForm.phone,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Email field',
      },
      {
        name: 'picture',
        value: userForm.picture,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Picture field',
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
    updateMyUser(`${url}/${user?.username}`, data, setMessage)
  }

  const handleSubmitAuth = async (e: React.FormEvent) => {
    if (userForm.confirmPassword && userForm.password && userForm.newPassword) {
      if (userForm.newPassword.length < 6) {
        setMessage('Sorry, password cannot be less than 6 characters.', false)
        return
      }
      if (userForm.confirmPassword !== userForm.newPassword) {
        setMessage('Sorry, passwords does not match please try again.', false)
        return
      }
    }

    const inputsToValidate = [
      {
        name: 'password',
        value: userForm.password,
        rules: { blank: false, maxLength: 100 },
        field: 'Password field',
      },
      {
        name: 'newPassword',
        value: userForm.newPassword,
        rules: { blank: false, maxLength: 100 },
        field: 'New Password field',
      },
      {
        name: 'isTwoFactor',
        value: userForm.isTwoFactor,
        rules: { blank: false, maxLength: 100 },
        field: 'Two factor field',
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
    updateAuthUser(`${url}/${user?.username}`, data, setMessage)
  }

  return (
    <>
      <div className="card_body sharp h-full mb-10">
        <div className="custom_sm_title">Basic Settings</div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col relative">
            <div className="relative my-5 w-full max-w-[200px] h-[150px]">
              <div className="relative w-full max-w-[200px] h-[150px] rounded-xl  overflow-hidden">
                {preview ? (
                  <PictureDisplay source={String(preview)} />
                ) : userForm?.picture ? (
                  <PictureDisplay source={String(userForm.picture)} />
                ) : (
                  <PictureDisplay source={'/images/avatar.jpg'} />
                )}
              </div>
              <label
                htmlFor="picture"
                className="w-10 h-10 flex justify-center items-center cursor-pointer bg-[var(--customColor)] text-white rounded-full absolute -bottom-3 -right-3"
              >
                <input
                  className="input-file"
                  type="file"
                  name="picture"
                  id="picture"
                  accept="image/*"
                  onChange={handleFileChange('picture')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl"></i>
              </label>
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
              <input
                className="form-input"
                name="fullName"
                value={userForm.fullName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter domain"
              />
            </div>
            <div className="mb-3">
              <label className="label" htmlFor="">
                Phone Number
              </label>
              <input
                className="form-input"
                name="phone"
                value={userForm.phone}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter phone"
              />
            </div>
          </div>
        </div>

        <div className="table-action flex flex-wrap">
          {loading ? (
            <button className="custom_btn mx-auto">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button className="custom_btn mx-auto" onClick={handleSubmit}>
                Submit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card_body sharp h-full">
        <div className="custom_sm_title">Authentication Settings</div>

        <div className="grid-2 grid-lay">
          <div className="mb-3">
            <label className="label" htmlFor="">
              Old Password
            </label>
            <input
              className="form-input"
              name="password"
              value={userForm.password}
              onChange={handleInputChange}
              type="password"
              placeholder="Enter old password"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-3">
              <label className="label" htmlFor="">
                New Password
              </label>
              <input
                className="form-input"
                name="newPassword"
                value={userForm.newPassword}
                onChange={handleInputChange}
                type="password"
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-3">
              <label className="label" htmlFor="">
                Confirm Password
              </label>
              <input
                className="form-input"
                name="confirmPassword"
                value={userForm.confirmPassword}
                onChange={handleInputChange}
                type="password"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="label mb-3" htmlFor="">
              Two Factor Authentication
            </label>
            <button
              onClick={() => toggleTwoFactor()}
              className={`switch_btn mr-auto ${userForm.isTwoFactor ? 'active' : ''
                }`}
              aria-label="Toggle Job Posting"
            >
              <div
                className={`switch_ball ${userForm.isTwoFactor ? 'active' : ''
                  }`}
              />
            </button>
          </div>
        </div>

        <div className="table-action flex flex-wrap">
          {autLoading ? (
            <button className="custom_btn mx-auto">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button className="custom_btn mx-auto" onClick={handleSubmitAuth}>
                Submit
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default BasicSettings

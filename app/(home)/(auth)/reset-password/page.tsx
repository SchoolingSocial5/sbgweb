'use client'
import Image from 'next/image'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ValidationResult } from '@/lib/validateInputs'
import apiRequest, { ApiResponseInterface } from '@/lib/axios'

export default function ResetPassword() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<ValidationResult | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const { password, confirmPassword } = formData
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      setError({ passwordMessage: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character", valid: false })
      return
    }
    if (password !== confirmPassword) {
      setError({ confirmPasswordMessage: "Password does not match, try again.", valid: false })
      return
    }

    setLoading(true)

    const form = new FormData()
    form.append('password', formData.password.trim())

    try {
      setLoading(true)
      const response = await apiRequest<ApiResponseInterface>('/users/reset-password', {
        method: 'POST',
        body: form,
      })

      if (response.status === 200) {
        router.replace('/reset-successful')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setGeneralError(error.response?.data?.message || 'Login failed')
      } else {
        setGeneralError('Unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <div className="flex flex-col items-center mb-10">
        <Image
          style={{ height: 'auto', width: 50 }}
          src="/Icon.png"
          loading="lazy"
          sizes="100vw"
          className="my-auto mr-2"
          width={0}
          height={0}
          alt="Paragon Farms Logo"
        />
        <h2 className="text-2xl uppercase mb-[-6px] font-semibold text-[var(--custom-text-color)]">
          SBG Egg Farm
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="homeInputLabel">Password</label>

          <div className="relative">
            <i className="bi bi-shield-lock absolute top-3 left-2 text-lg"></i>
            <input
              className="customHomeInput pl-7"
              placeholder="Enter password"
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              type={`${showPassword ? 'text' : 'password'}`}
            />
            <i
              onClick={togglePasswordVisibility}
              className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'
                }  cursor-pointer text-lg absolute right-2 top-3`}
            ></i>
          </div>
          {error?.passwordMessage && (
            <div className="text-red-500 text-sm">{error.passwordMessage}</div>
          )}
        </div>
        <div>
          <label className="homeInputLabel">Confirm Password</label>

          <div className="relative">
            <i className="bi bi-shield-lock absolute top-3 left-2 text-lg"></i>
            <input
              className="customHomeInput pl-7"
              placeholder="Confirm password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              type={`${showPassword ? 'text' : 'password'}`}
            />
            <i
              onClick={togglePasswordVisibility}
              className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'
                }  cursor-pointer text-lg absolute right-2 top-3`}
            ></i>
          </div>
          {error?.confirmPasswordMessage && (
            <div className="text-red-500 text-sm">
              {error.confirmPasswordMessage}
            </div>
          )}
        </div>


        <button type="submit" className="homeButton">
          {loading ? 'Processing...' : 'Reset Password'}
        </button>
        {generalError && (
          <div className="text-red-500 text-center text-sm">{generalError}</div>
        )}
      </form>
    </>
  )
}

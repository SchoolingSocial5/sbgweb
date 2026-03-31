'use client'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { validateSignUp, ValidationResult } from '@/lib/validateInputs'
import apiRequest, { ApiResponseInterface } from '@/lib/axios'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import Spinner from '@/components/LoadingAnimations/Spinner'

export default function SignInClient() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<ValidationResult | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const { password, username } = formData
    const validation = validateSignUp(password, username)

    if (!validation.valid) {
      setError(validation)
      return
    }

    setLoading(true)
    const form = new FormData()
    form.append('username', formData.username.trim())
    form.append('password', formData.password.trim())

    try {
      setLoading(true)
      const response = await apiRequest<ApiResponseInterface>('/users/login/', {
        method: 'POST',
        body: form,
      })

      if (response.status === 200) {
        const { user, token } = response.data
        AuthStore.getState().login(user, token)

        setTimeout(() => {
          if (user.status === 'Staff') {
            router.replace('/admin/profile')
          } else {
            router.replace('/dashboard')
          }
        }, 100)
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
          <label className="homeInputLabel">Username</label>
          <input
            type="text"
            className="customHomeInput pl-2"
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="Enter username"
          />
          {error?.usernameMessage && (
            <div className="text-red-500 text-sm">{error.usernameMessage}</div>
          )}
        </div>
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
        <div className="text-sm block">
          {`Don't have an account? `}
          <Link
            href={`/sign-up`}
            className="text-[var(--custom-text-color)] hover:underline"
          >
            Click Here.
          </Link>
        </div>

        {loading ? (
          <button
            type="button"
            className="homeButton"
            style={{ width: '100%' }}
          >
            <Spinner size={30} />
          </button>
        ) : (
          <button type="submit" className="homeButton">
            Login
          </button>
        )}
        {generalError && (
          <div className="text-red-500 text-sm">{generalError}</div>
        )}
        <Link
          href={`/forgotten-password`}
          className="mt-1 text-center text-sm text-[var(--custom-text-color)] block hover:underline"
        >
          Forgot Password?
        </Link>
      </form>
    </>
  )
}

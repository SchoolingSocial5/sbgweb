'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ValidationResult } from '@/lib/validateInputs'
import apiRequest, { ApiResponseInterface } from '@/lib/axios'
import Spinner from '@/components/Spinner'

export default function ForgottenPassword() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<ValidationResult | null>(null)

  const [formData, setFormData] = useState({
    email: '',
  })



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const { email } = formData
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError({ emailMessage: "Please enter a valid email.", valid: false })
      return
    }

    setLoading(true)
    const form = new FormData()
    form.append('email', formData.email.trim())

    try {
      setLoading(true)
      await apiRequest<ApiResponseInterface>('/users/forgot-password', {
        method: 'POST',
        body: form,
      })
    } catch (error) {
      if (error) {
      }
    } finally {
      setLoading(false)
      localStorage.setItem("auth_email", email)
      setTimeout(() => {
        router.replace('/pass-code')
      }, 100)
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
          <label className="homeInputLabel">Email</label>
          <input
            type="text"
            className="customHomeInput pl-2"
            name="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Enter email"
          />
          {error?.emailMessage && (
            <div className="text-red-500 text-sm">{error.emailMessage}</div>
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
            Submit Email
          </button>
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

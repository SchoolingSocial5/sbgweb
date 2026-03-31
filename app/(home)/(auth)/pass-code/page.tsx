'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import apiRequest, { ApiResponseInterface } from '@/lib/axios'
import { ValidationResult } from '@/lib/validateInputs'
import axios from 'axios'
import Spinner from '@/components/Spinner'

const PassCode: React.FC = () => {
    const router = useRouter()
    const [error, setError] = useState<ValidationResult | null>(null)
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const inputsRef = useRef<Array<HTMLInputElement | null>>([])

    // Handle input change
    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus()
        }
    }

    // Handle backspace
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus()
        }
    }

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasteData = e.clipboardData.getData('text').slice(0, 6)
        if (!/^\d+$/.test(pasteData)) return

        const newCode = pasteData.split('')
        setCode([...newCode, ...Array(6 - newCode.length).fill('')])
        inputsRef.current[pasteData.length - 1]?.focus()
    }

    const handleSubmit = async () => {
        const joinedCode = code.join('')
        if (joinedCode.length !== 6) {
            setError({
                emailMessage: 'Please enter 6 character code sent to your email.',
                valid: false,
            })
            return
        } else {
            setError(null)
        }

        const authEmail = localStorage.getItem("auth_email")
        if (!authEmail) {
            return
        }
        const userDetails = new FormData()
        userDetails.append('code', joinedCode)
        userDetails.append('email', authEmail)
        try {
            setLoading(true)
            const response = await apiRequest<ApiResponseInterface>('/users/reset-code', {
                method: 'POST',
                body: userDetails,
            })

            if (response.status === 200) {
                localStorage.setItem("auth_code", joinedCode)
                setTimeout(() => {
                    router.replace('/reset-password')
                }, 100)
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Server Error Data:", error.response?.data);
                setError({ emailMessage: error.response?.data?.message || 'Code validation failed', valid: false })
            } else {
                setError({ emailMessage: 'Unexpected error occurred', valid: false })
            }
        } finally {
            setLoading(false)
            router.replace('/reset-password')
        }
    }

    const resendEmail = async () => {
        const email = localStorage.getItem("auth_email")
        setLoading(true)
        const form = new FormData()
        form.append('email', email ? email : '')

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
            setError({ emailMessage: "Email has been sent.", valid: true })
        }
    }
    return (
        <>
            <div className="text-xl text-center mb-4">Enter the Auth Code Sent to your Email</div>

            <form className="w-full">
                <div className="flex gap-2 justify-center my-4">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputsRef.current[index] = el
                            }} type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                            className="sm:w-12 sm:h-12 w-10 h-10 text-center  text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--customColor)]"
                        />
                    ))}
                </div>

                {error && (
                    <p className={`${error.valid ? "text-green-500" : "text-red-500"} text-sm text-center mb-2`}>
                        {error.emailMessage}
                    </p>
                )}

                {loading ? (
                    <button
                        type="button"
                        className="homeButton"
                        style={{ width: '100%' }}
                    >
                        <Spinner size={30} />
                    </button>
                ) : (
                    <div onClick={handleSubmit} className="homeButton">
                        Submit Code
                    </div>
                )}

                <div className="mt-3 text-center">
                    {`Didn't receive an email`}?
                    <span onClick={resendEmail}
                        className="text-[var(--custom-color)] cursor-pointer"
                        style={{ display: 'inline-block', marginLeft: '3px' }}
                    >
                        Resend Email
                    </span>
                </div>
            </form>
        </>
    )
}

export default PassCode

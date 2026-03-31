'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import EmailStore from '@/src/zustand/notification/Email'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import QuillEditor from '@/components/Admin/QuillEditor'
import { useParams, } from 'next/navigation'

const EmailForm: React.FC = () => {
    const url = '/emails/'
    const { id } = useParams()
    const [name, setName] = useState('')
    const { setMessage } = MessageStore()
    const {
        emailForm,
        results,
        loading,
        setForm,
        getEmail,
        updateItem,
        postItem,
    } = EmailStore()
    const { user } = AuthStore()

    useEffect(() => {
        const initialize = async () => {
            if (id) {
                setName(String(name))
                const existingItem = results.find((item) => item._id === String(id))
                if (existingItem) {
                    EmailStore.setState({ emailForm: existingItem })
                } else {
                    await getEmail(`${url}/${id}`, setMessage)
                }
            }
        }

        initialize()
    }, [id])

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setForm(name as keyof typeof emailForm, value)
    }

    const handleFileChange =
        (key: keyof typeof emailForm) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files ? e.target.files[0] : null
                setForm(key, file)
            }

    const handleSubmit = async (e: React.FormEvent) => {
        const inputsToValidate = [
            {
                name: 'greetings',
                value: emailForm.greetings,
                rules: { blank: false },
                field: 'Greetings field',
            },
            {
                name: 'content',
                value: emailForm.content,
                rules: { blank: false },
                field: 'Email Content field',
            },
            {
                name: 'picture',
                value: emailForm.picture,
                rules: { blank: false, maxSize: 3 },
                field: 'Email banner',
            },
            {
                name: 'title',
                value: emailForm.title,
                rules: { blank: false, minLength: 3 },
                field: 'Email title field',
            },
            {
                name: 'sendable',
                value: emailForm.sendable,
                rules: { blank: false },
                field: 'Email note field',
            },
            {
                name: 'name',
                value: emailForm.name,
                rules: { blank: true, minLength: 3, maxLength: 1000 },
                field: 'Email name field',
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
        if (id) {
            updateItem(`${url}${id}/`, data, setMessage, () => EmailStore.setState({ isEmailForm: false }))
        } else {
            await postItem(url, data, setMessage, () => EmailStore.setState({ isEmailForm: false }))
        }
    }

    return (
        <>
            <div
                onClick={() => {
                    EmailStore.setState({ isEmailForm: false })
                }}
                className="fixed h-full w-full z-40 left-0 top-0 bg-black/50 items-center justify-center flex"
            >
                <div onClick={(e) => {
                    e.stopPropagation()
                }} className="card_body sharp">

                    <div className="grid-2 grid-lay">
                        {user && user.staffRanking > 19 ? (
                            <div className="flex flex-col">
                                <label className="label" htmlFor="">
                                    Email Name
                                </label>
                                <input
                                    className="form-input"
                                    name="name"
                                    value={emailForm.name}
                                    onChange={handleInputChange}
                                    type="text"
                                    placeholder="Enter email name"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <label className="label" htmlFor="">
                                    Email Name
                                </label>
                                <input
                                    className="form-input"
                                    name="name"
                                    value={emailForm.name}
                                    onChange={handleInputChange}
                                    type="text"
                                    placeholder="Enter email name"
                                />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <label className="label" htmlFor="">
                                Email Title
                            </label>
                            <input
                                className="form-input"
                                type="text"
                                name="title"
                                value={emailForm.title}
                                onChange={handleInputChange}
                                placeholder="Enter email title"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="label" htmlFor="">
                                Email Greetings
                            </label>
                            <input
                                className="form-input"
                                type="text"
                                name="greetings"
                                value={emailForm.greetings}
                                onChange={handleInputChange}
                                placeholder="Enter email greeting"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="label" htmlFor="">
                                Email Note
                            </label>
                            <div className="flex">
                                <div
                                    onClick={() => setForm('sendable', !emailForm.sendable)}
                                    className={`${emailForm.sendable
                                        ? 'bg-[var(--customRedColor)] text-white'
                                        : 'bg-[var(--secondary)]'
                                        } px-3 py-2 cursor-pointer`}
                                >
                                    Email Sendable
                                </div>
                            </div>
                        </div>
                    </div>

                    <QuillEditor
                        contentValue={emailForm.content}
                        onChange={(content) => setForm('content', content)}
                    />

                    <div className="table_action">
                        {loading ? (
                            <button className="custom_btn">
                                <i className="bi bi-opencollective loading"></i>
                                Processing...
                            </button>
                        ) : (
                            <>
                                <label htmlFor="banner" className="custom_btn ">
                                    <input
                                        className="input-file"
                                        type="file"
                                        name="picture"
                                        id="banner"
                                        accept="image/*"
                                        onChange={handleFileChange('picture')}
                                    />
                                    <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                                    Upload
                                </label>
                                <button className="custom_btn ml-2" onClick={handleSubmit}>
                                    Create Email
                                </button>
                                <Link
                                    href="/admin/company/emails"
                                    className="custom_btn ml-auto "
                                >
                                    Email Tables
                                </Link>
                            </>
                        )}
                    </div>
                </div></div>
        </>
    )
}

export default EmailForm

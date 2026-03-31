'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import PositionStore from '@/src/zustand/app/Position'

const PositionSheet: React.FC = () => {
    const {
        positionFormData,
        loading, reshuffleResults,
        updateItem,
        postItem,
        setPositionForm,
    } = PositionStore()
    const { setMessage } = MessageStore()
    const pathname = usePathname()
    const { setAlert } = AlartStore()
    const { user } = AuthStore()
    const url = '/company/positions'

    useEffect(() => {
        reshuffleResults()
    }, [pathname])

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setPositionForm(name as keyof typeof positionFormData, value)

    }


    const handleSubmit = async () => {
        if (!user) {
            setMessage('Please login to continue', false)
            return
        }

        const inputsToValidate = [
            {
                name: 'position',
                value: positionFormData.position,
                rules: { blank: true, minLength: 1, maxLength: 100 },
                field: 'Position field',
            },
            {
                name: 'salary',
                value: positionFormData.salary,
                rules: { blank: true, minLength: 1, maxLength: 100 },
                field: 'Salary field',
            },
            {
                name: 'level',
                value: positionFormData.level,
                rules: { blank: true, minLength: 1, maxLength: 100 },
                field: 'Level field',
            },
            {
                name: 'role',
                value: positionFormData.role,
                rules: { blank: true, maxLength: 1000 },
                field: 'Role field',
            },
            {
                name: 'duties',
                value: positionFormData.duties,
                rules: { blank: true, maxLength: 1000 },
                field: 'Duties field',
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

        if (positionFormData._id) {
            setAlert(
                'Warning',
                'Are you sure you want to update this position record',
                true,
                () =>
                    updateItem(
                        `${url}/${positionFormData._id}`,
                        data,
                        setMessage
                    ).then(() => PositionStore.setState({ showPosition: false }))
            )
        } else {
            setAlert(
                'Warning',
                'Are you sure you want to create this position record',
                true,
                () =>
                    postItem(
                        `${url}`,
                        data,
                        setMessage
                    ).then(() => PositionStore.setState({ showPosition: false }))
            )
        }
    }

    return (
        <>
            <div
                onClick={() => PositionStore.setState({ showPosition: false })}
                className="fixed h-full w-full z-30 left-0 top-0 bg-black/50 items-center justify-center flex"
            >
                <div
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    className="card_body sharp rounded-xl w-full max-w-[600px]"
                >
                    <div className="custom_sm_title text-center mb-5">{positionFormData._id ? 'Edit Position' : 'Create Position'}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="label" htmlFor="">
                                Position Name
                            </label>
                            <input
                                className="form-input"
                                name="position"
                                value={positionFormData.position}
                                onChange={handleInputChange}
                                type="text"
                                placeholder="Enter position"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="label" htmlFor="">
                                Role
                            </label>
                            <input
                                className="form-input"
                                name="role"
                                value={positionFormData.role}
                                onChange={handleInputChange}
                                type="text"
                                placeholder="Enter role"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="label" htmlFor="">
                                Level
                            </label>
                            <input
                                className="form-input"
                                name="level"
                                value={positionFormData.level}
                                onChange={handleInputChange}
                                type="number"
                                placeholder="Enter level"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="label" htmlFor="">
                                Salary
                            </label>
                            <input
                                className="form-input"
                                name="salary"
                                value={positionFormData.salary}
                                onChange={handleInputChange}
                                type="number"
                                placeholder="Enter salary"
                            />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label className="label" htmlFor="">
                                Duties
                            </label>
                            <textarea
                                className="form-input"
                                name="duties"
                                rows={4}
                                value={positionFormData.duties}
                                onChange={handleInputChange}
                                placeholder="Enter duties"
                            />
                        </div>
                    </div>

                    <div className="table-action mt-5 flex flex-wrap">
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
                                    {positionFormData._id ? 'Update' : 'Create'}
                                </button>

                                <button
                                    className="custom_btn danger ml-auto"
                                    onClick={() => PositionStore.setState({ showPosition: false })}
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

export default PositionSheet

'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { MessageStore } from '@/src/zustand/notification/Message'
import QuillEditor from '@/components/Admin/QuillEditor'
import { useParams } from 'next/navigation'
import NotificationTemplateStore from '@/src/zustand/notification/NotificationTemplate'

const NotificationForm: React.FC = () => {
    const url = '/notifications/templates'
    const { id } = useParams()
    const { setMessage } = MessageStore()
    const { formData, loading, setForm, postItem, updateItem } = NotificationTemplateStore()

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setForm(name as keyof typeof formData, value)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        const inputsToValidate = [
            {
                name: 'greetings',
                value: formData.greetings,
                rules: { blank: false },
                field: 'Greetings field',
            },
            {
                name: 'content',
                value: formData.content,
                rules: { blank: false },
                field: 'Content field',
            },

            {
                name: 'title',
                value: formData.title,
                rules: { blank: false, minLength: 3 },
                field: 'Title field',
            },
            {
                name: 'name',
                value: formData.name,
                rules: { blank: true, minLength: 3, maxLength: 1000 },
                field: 'Name field',
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
            updateItem(`${url}${id}/`, data, setMessage, () => NotificationTemplateStore.setState({ isNoteForm: false }))
        } else {
            await postItem(url, data, setMessage, () => NotificationTemplateStore.setState({ isNoteForm: false }))
        }
    }

    return (
        <>
            <div
                onClick={() => {
                    NotificationTemplateStore.setState({ isNoteForm: false })
                }}
                className="fixed h-full w-full z-40 left-0 top-0 bg-black/50 items-center justify-center flex"
            >
                <div onClick={(e) => {
                    e.stopPropagation()
                }} className="card_body sharp">

                    <div className="grid-2 grid-lay">
                        <div className="flex flex-col">
                            <label className="label" htmlFor="">
                                Name
                            </label>
                            <input
                                className="form-input"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                type="text"
                                placeholder="Enter notification name"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="label" htmlFor="">
                                Title
                            </label>
                            <input
                                className="form-input"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter notification title"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="label" htmlFor="">
                                Greetings
                            </label>
                            <input
                                className="form-input"
                                type="text"
                                name="greetings"
                                value={formData.greetings}
                                onChange={handleInputChange}
                                placeholder="Enter notification greeting"
                            />
                        </div>
                    </div>

                    <QuillEditor
                        contentValue={formData.content}
                        onChange={(content) => {
                            NotificationTemplateStore.setState((prev) => {
                                return {
                                    formData: { ...prev.formData, content: content },
                                }
                            })
                        }}
                    />

                    <div className="table_action">
                        {loading ? (
                            <button className="custom_btn">
                                <i className="bi bi-opencollective loading"></i>
                                Processing...
                            </button>
                        ) : (
                            <>
                                <button className="custom_btn ml-2" onClick={handleSubmit}>
                                    Create Notification
                                </button>
                                <div onClick={() => {
                                    NotificationTemplateStore.setState({ isNoteForm: false })
                                }}
                                    className="custom_btn ml-auto "
                                >
                                    Close Form
                                </div>
                            </>
                        )}
                    </div>
                </div></div>
        </>
    )
}

export default NotificationForm

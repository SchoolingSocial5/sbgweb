'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import QuillEditor from '@/components/Admin/QuillEditor'
import { useParams, useRouter } from 'next/navigation'
import NotificationTemplateStore from '@/src/zustand/notification/NotificationTemplate'

const CreateNotification: React.FC = () => {
  const url = '/notifications/templates'
  const { id } = useParams()
  const [name, setName] = useState('')
  const { setMessage } = MessageStore()
  const { formData, setForm, getItem, results, loading, updateItem, postItem } =
    NotificationTemplateStore()
  const router = useRouter()

  useEffect(() => {
    const initialize = async () => {
      if (id) {
        setName(String(name))
        const existingItem = results.find((item) => item._id === String(id))
        if (existingItem) {
          NotificationTemplateStore.setState({ formData: existingItem })
        } else {
          await getItem(`${url}/${id}`, setMessage)
        }
      }
    }

    initialize()
  }, [id])

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
        field: 'Notification Content field',
      },

      {
        name: 'title',
        value: formData.title,
        rules: { blank: false, minLength: 3 },
        field: 'Notification title field',
      },
      {
        name: 'name',
        value: formData.name,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Notification name field',
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
      updateItem(`${url}/${id}`, data, setMessage, () => router.back())
    } else {
      await postItem(url, data, setMessage, () => router.back())
    }
  }

  return (
    <>
      <div className="card_body sharp">
        <div className="custom_sm_title">
          {id ? `Updating Notification` : `Create Notification`}
        </div>
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
                Submit
              </button>
              <Link
                href="/admin/company/notification-templates"
                className="custom_btn ml-auto "
              >
                Tables
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateNotification

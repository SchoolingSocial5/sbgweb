'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useParams } from 'next/navigation'
import QuillEditor from './QuillEditor'
import FaqStore from '@/src/zustand/faq'

const CreateFaq: React.FC = () => {
  const {
    getFaq,
    setForm,
    resetForm,
    postFaq,
    updateFaq,
    showForm,
    faqForm,
    loading,
    faqs,
  } = FaqStore()
  const url = '/faqs'
  const [name, setName] = useState('')
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { id } = useParams()
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

  useEffect(() => {
    const initialize = async () => {
      if (id) {
        setName(String(name))
        const existingItem = faqs.find((item) => item._id === String(id))
        if (existingItem) {
          FaqStore.setState({ faqForm: existingItem })
        } else {
          await getFaq(`${url}/${id}`, setMessage)
        }
      }
    }

    initialize()
    return () => {
      resetForm()
    }
  }, [id])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof faqForm, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'question',
        value: faqForm.question,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Question field',
      },
      {
        name: 'answer',
        value: faqForm.answer,
        rules: { blank: true, minLength: 3, maxLength: 2000 },
        field: 'Answer field',
      },
      {
        name: 'category',
        value: faqForm.category,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Category field',
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
    if (faqForm._id) {
      updateFaq(`${url}/${faqForm._id}${queryParams}`, data, setMessage, () =>
        showForm(false)
      )
    } else {
      postFaq(`${url}${queryParams}`, data, setMessage, () => showForm(false))
    }
  }

  return (
    <div
      onClick={() => showForm(false)}
      className="bg-black/50 fixed w-full z-40 top-0 left-0 h-[100vh] flex justify-center items-center overflow-y-scroll"
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="card_body sharp max-w-[700px]"
      >
        <div className="custom_sm_title">
          {name ? `Update Faq` : `Create Faq`}
        </div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Question
            </label>
            <input
              className="form-input"
              name="question"
              value={faqForm.question}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter question"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Category
            </label>
            <input
              className="form-input"
              name="category"
              value={faqForm.category}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter category"
            />
          </div>
        </div>

        <QuillEditor
          contentValue={faqForm.answer}
          onChange={(content) => setForm('answer', content)}
        />

        <div className="table-action flex flex-wrap">
          {loading ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button className="custom_btn" onClick={handleSubmit}>
                Submit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateFaq

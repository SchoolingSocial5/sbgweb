'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useParams, useRouter } from 'next/navigation'
import PictureDisplay from '@/components/PictureDisplay'
import BlogStore from '@/src/zustand/Blog'
import QuillEditor from '../QuillEditor'

const CreateBlog: React.FC = () => {
  const {
    getBlog,
    setForm,
    resetForm,
    postBlog,
    updateBlog,
    blogForm,
    loading,
    blogs,
  } = BlogStore()
  const url = '/blogs'
  const [name, setName] = useState('')
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { id } = useParams()
  const router = useRouter()
  const [preview, setPreview] = useState<string | null>(null)
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

  useEffect(() => {
    const initialize = async () => {
      if (id) {
        setName(String(name))
        const existingItem = blogs.find((item) => item._id === String(id))
        if (existingItem) {
          BlogStore.setState({ blogForm: existingItem })
        } else {
          await getBlog(`${url}/${id}`,)
        }
      }
    }

    initialize()
    return () => {
      resetForm()
    }
  }, [id])

  const handleFileChange =
    (key: keyof typeof blogForm) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null
        setForm(key, file)
        if (key === 'picture' && file) {
          const localUrl = URL.createObjectURL(file)
          setPreview(localUrl)
        }
      }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof blogForm, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'title',
        value: blogForm.title,
        rules: { blank: false, maxLength: 100 },
        field: 'Title field',
      },
      {
        name: 'subtitle',
        value: blogForm.subtitle,
        rules: { blank: false, maxLength: 100 },
        field: 'Subtitle field',
      },
      {
        name: 'category',
        value: blogForm.category,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Category field',
      },

      {
        name: 'picture',
        value: blogForm.picture,
        rules: { blank: false, maxLength: 1000 },
        field: 'Picture field',
      },
      {
        name: 'content',
        value: blogForm.content,
        rules: { blank: false, maxSize: 10000 },
        field: 'Content file',
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
      updateBlog(`${url}/${id}${queryParams}`, data, setMessage, () =>
        router.push(`/admin/pages/blog`)
      )
    } else {
      postBlog(`${url}${queryParams}`, data, setMessage, () =>
        router.push(`/admin/pages/blog`)
      )
    }
  }

  return (
    <>
      <div className="card_body sharp">
        <div className="custom_sm_title">
          {name ? `Update Blog` : `Create Blog`}
        </div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Title
            </label>
            <input
              className="form-input"
              name="title"
              value={blogForm.title}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter title"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Subtitle
            </label>
            <input
              className="form-input"
              name="subtitle"
              value={blogForm.subtitle}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter subtitle"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Category
            </label>
            <input
              className="form-input"
              name="category"
              value={blogForm.category}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter category"
            />
          </div>
        </div>

        <div className="flex w-full justify-center">
          <div className="relative my-5 w-full max-w-[200px] h-[150px] rounded-xl  overflow-hidden">
            {preview ? (
              <PictureDisplay source={String(preview)} />
            ) : blogForm?.picture ? (
              <PictureDisplay source={String(blogForm.picture)} />
            ) : (
              <div className="bg-[var(--secondary)] h-full w-full" />
            )}
          </div>
        </div>

        <QuillEditor
          contentValue={blogForm.content}
          onChange={(content) => setForm('content', content)}
        />

        <div className="table-action flex flex-wrap">
          {loading ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <label htmlFor="picture" className="custom_btn mr-3">
                <input
                  className="input-file"
                  type="file"
                  name="picture"
                  id="picture"
                  accept="image/*"
                  onChange={handleFileChange('picture')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Picture
              </label>

              <button className="custom_btn" onClick={handleSubmit}>
                Submit
              </button>
              <Link href="/admin/products" className="custom_btn ml-auto ">
                Product Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateBlog

'use client'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import SocialStore from '@/src/zustand/Social'

const SocialForm: React.FC = () => {
  const {
    socialForm,
    loading,
    updateSocial,
    postSocial,
    setForm,
    resetForm,
    setShowSocialForm,
  } = SocialStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const url = `/socials`

  const handleFileChange =
    (key: keyof typeof socialForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
    }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof socialForm, value)
  }

  const handleSubmit = async () => {
    if (!user) {
      setMessage('Please login to continue', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'staffName',
        value: user?.fullName,
        rules: { blank: true },
        field: 'Staff Name field',
      },
      {
        name: 'socialType',
        value: socialForm.socialType,
        rules: { blank: false },
        field: 'Social type field',
      },
      {
        name: 'name',
        value: socialForm.name,
        rules: { blank: false },
        field: 'Name field',
      },
      {
        name: 'post',
        value: socialForm.post,
        rules: { blank: true },
        field: 'Post field',
      },
      {
        name: 'picture',
        value: socialForm.picture,
        rules: { blank: false },
        field: 'Picture field',
      },

      {
        name: 'likes',
        value: socialForm.likes,
        rules: { blank: false },
        field: 'Like field',
      },
      {
        name: 'views',
        value: socialForm.views,
        rules: { blank: false },
        field: 'Like field',
      },
      {
        name: 'comments',
        value: socialForm.comments,
        rules: { blank: false },
        field: 'Feed field',
      },
      {
        name: 'url',
        value: socialForm.url,
        rules: { blank: false },
        field: 'Url field',
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
    setAlert(
      'Warning',
      'Are you sure you want to submit this consumption record',
      true,
      () =>
        socialForm._id
          ? updateSocial(
              `/consumptions/${socialForm._id}/?ordering=-createdAt`,
              data,
              setMessage,
              () => {
                setShowSocialForm(false)
                resetForm()
              }
            )
          : postSocial(`${url}?ordering=-createdAt`, data, setMessage, () => {
              setShowSocialForm(false)
              resetForm()
            })
    )
  }

  return (
    <>
      <div
        onClick={() => setShowSocialForm(false)}
        className="fixed h-full w-full z-30 left-0 top-0 bg-black/50 items-center justify-center flex"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="card_body sharp w-full max-w-[800px]"
        >
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Name
              </label>
              <input
                className="form-input"
                name="name"
                value={socialForm.name}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter social media name"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Social Type
              </label>
              <input
                className="form-input"
                name="socialType"
                value={socialForm.socialType}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter social type"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Likes
              </label>
              <input
                className="form-input"
                name="likes"
                value={socialForm.likes}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter likes"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Views
              </label>
              <input
                className="form-input"
                name="views"
                value={socialForm.views}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter Views"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Comments
              </label>
              <input
                className="form-input"
                name="comments"
                value={socialForm.comments}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter comments"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Post URL
              </label>
              <input
                className="form-input"
                name="url"
                value={socialForm.url}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter url"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Staff
              </label>
              <div className="form-input">{user?.fullName}</div>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Post
            </label>
            <textarea
              placeholder="Write the post"
              className="form-input"
              name="post"
              value={socialForm.post}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="table-action gap-3 mt-3 flex flex-wrap">
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
                <label htmlFor="picture" className="custom_btn ">
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
                <button
                  className="custom_btn danger ml-auto"
                  onClick={() => setShowSocialForm(false)}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SocialForm

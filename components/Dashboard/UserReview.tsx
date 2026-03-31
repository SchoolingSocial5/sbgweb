'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useEffect } from 'react'
import PictureDisplay from '@/components/PictureDisplay'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import RatingStore from '@/src/zustand/Rating'

const UserReview: React.FC = () => {
  const url = '/reviews'
  const { ratingForm, setForm, loading, getRating, updateRating } =
    RatingStore()
  const { setMessage } = MessageStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (user) {
      getRating(`${url}/${user.username}`, setMessage)
    }
  }, [user])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof ratingForm, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'username',
        value: String(user?.username),
        rules: { blank: false, maxLength: 100 },
        field: 'Username field',
      },
      {
        name: 'fullName',
        value: String(user?.fullName),
        rules: { blank: false, maxLength: 100 },
        field: 'Full name field',
      },
      {
        name: 'rating',
        value:
          ratingForm.rating < 3
            ? 3
            : ratingForm.rating > 5
            ? 5
            : ratingForm.rating,
        rules: { blank: false, maxLength: 100 },
        field: 'Rating field',
      },
      {
        name: 'review',
        value: ratingForm.review,
        rules: { blank: true, minLength: 20, maxLength: 1000 },
        field: 'Review field',
      },
      {
        name: 'picture',
        value: String(user?.picture),
        rules: { blank: false, maxLength: 100 },
        field: 'Picture field',
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
    updateRating(`${url}/${user?.username}`, data, setMessage)
  }

  return (
    <>
      <div className="card_body sharp h-full mb-10">
        <div className="custom_sm_title">Make Review</div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col relative">
            <div className="relative w-full max-w-[150px] h-[150px] rounded-full mb-10  overflow-hidden">
              {user?.picture ? (
                <PictureDisplay source={String(user.picture)} />
              ) : (
                <PictureDisplay source={'/images/avatar.jpg'} />
              )}
            </div>

            <div className="mb-3">
              <label className="label" htmlFor="">
                Rate Our Service
              </label>
              <input
                className="form-input"
                name="rating"
                min={3}
                max={5}
                minLength={1}
                maxLength={1}
                value={ratingForm.rating}
                onChange={handleInputChange}
                type="number"
                placeholder="Drop us 5"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="mb-3">
              <label className="label" htmlFor="">
                Customer Name
              </label>
              <div className="form-input">{user?.fullName}</div>
            </div>
            <div className="mb-3">
              <label className="label" htmlFor="">
                Rating Review
              </label>
              <textarea
                value={ratingForm.review}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Write your review"
                name="review"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="table-action flex flex-wrap">
          {loading ? (
            <button className="custom_btn mx-auto">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button className="custom_btn mx-auto" onClick={handleSubmit}>
                Submit
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default UserReview

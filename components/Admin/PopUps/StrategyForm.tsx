'use client'
import { appendForm } from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import StrategyStore from '@/src/zustand/Strategy'
import { useState } from 'react'

const StrategyForm: React.FC = () => {
  const {
    strategyForm,
    loading,
    updateStrategy,
    postStrategy,
    setForm,
    resetForm,
    setShowStrategyForm,
  } = StrategyStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const { user } = AuthStore()
  const url = `/strategies`
  const [strategy, setStrategy] = useState('')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof strategyForm, value)
  }

  const addStrategy = () => {
    StrategyStore.setState((prev) => {
      return {
        strategyForm: {
          ...prev.strategyForm,
          strategies: [...prev.strategyForm.strategies, strategy],
        },
      }
    })
  }

  const handleSubmit = async () => {
    if (!user) {
      setMessage('Please login to continue', false)
      return
    }

    if (strategyForm.strategies.length === 0) {
      setMessage('Please enter at least one strategy to continue', false)
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
        name: 'remark',
        value: strategyForm.remark,
        rules: { blank: false },
        field: 'Name type field',
      },
      {
        name: 'strategies',
        value: JSON.stringify(strategyForm.strategies),
        rules: { blank: false },
        field: 'Address field',
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
      'Are you sure you want to submit this strategy',
      true,
      () =>
        strategyForm._id
          ? updateStrategy(
              `/strategies/${strategyForm._id}/?ordering=-createdAt`,
              data,
              setMessage,
              () => {
                setShowStrategyForm(false)
                resetForm()
              }
            )
          : postStrategy(`${url}?ordering=-createdAt`, data, setMessage, () => {
              setShowStrategyForm(false)
              resetForm()
            })
    )
  }

  return (
    <>
      <div
        onClick={() => setShowStrategyForm(false)}
        className="fixed h-full w-full z-30 left-0 top-0 bg-black/50 items-center justify-center flex"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="card_body sharp w-full max-w-[700px]"
        >
          {strategyForm.strategies.map((s, i) => (
            <div key={i} className="mb-1 py-2 flex flex-col">
              {s}
            </div>
          ))}
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Strategic Title
            </label>
            <input
              className="form-input"
              name=""
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              type="text"
              placeholder="Enter strategy title"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Remark
            </label>
            <textarea
              placeholder="Write your marketing remark"
              className="form-input"
              name="remark"
              value={strategyForm.remark}
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
                <button className="custom_btn" onClick={addStrategy}>
                  Add Strategy
                </button>

                <button
                  className="custom_btn danger ml-auto"
                  onClick={() => setShowStrategyForm(false)}
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

export default StrategyForm

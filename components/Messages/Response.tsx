import { MessageStore } from '@/src/zustand/notification/Message'

export default function Response() {
  const { clearMessage, message, isSuccess } = MessageStore()

  return (
    <div className={`overlay `} onClick={clearMessage}>
      <div className="card_body max-w-[500px] px-2 w-full flex flex-col items-center border border-[var(--border-color)] text-lg">
        {isSuccess ? (
          <i className="bi bi-shield-check text-4xl text-green-500"></i>
        ) : (
          <i className="bi bi-exclamation-octagon text-4xl text-red-600"></i>
        )}
        <p
          className={`mt-3 text-center ${
            isSuccess ? 'text-green-500' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  )
}

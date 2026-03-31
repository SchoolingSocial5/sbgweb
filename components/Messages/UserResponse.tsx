import { MessageStore } from '@/src/zustand/notification/Message'
import { motion, AnimatePresence } from 'framer-motion'

export default function Response() {
  const { clearMessage, message, isSuccess } = MessageStore()

  return (
    <AnimatePresence>
      {message !== null && (
        <div className={`overlay z-50`} onClick={clearMessage}>
          <motion.div
            className={`text-white ${
              isSuccess ? 'bg-green-500' : 'bg-[var(--customRedColor)]'
            } rounded-[5px] py-[5px] px-2 reply max-w-[500px] w-full flex flex-col items-center `}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p className={`mt-1 text-center`}>{message}</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

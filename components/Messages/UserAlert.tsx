import { AlartStore } from '@/src/zustand/notification/Message'
import { motion, AnimatePresence } from 'framer-motion'

export default function UserAlert() {
  const { text, title, display, cancel, continue: confirmAction } = AlartStore()

  return (
    <AnimatePresence>
      {display && (
        <div className="overlay z-50">
          <motion.div
            className="text-white bg-[var(--customRedColor)] sm:rounded-xl rounded-[5px] py-3 px-2 reply max-w-[500px] w-full flex flex-col items-start text-lg"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="flex justify-center mb-1">
              <i className="bi bi-exclamation-triangle text-xl mr-3"></i>
              <div className="text-xl">{title}</div>
            </div>
            <p className="text-[16px] mb-3">{text}</p>
            <div className="flex text-sm">
              <button
                className="text-gray-300 rounded-[5px] py-1 px-5 border border-gray-300 mr-3"
                onClick={cancel}
              >
                Cancel
              </button>
              <button
                className="text-[var(--custom-color)] rounded-[5px] py-1 px-5 border border-gray-300 bg-white"
                onClick={confirmAction} // Trigger function on Continue
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

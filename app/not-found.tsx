'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicFooter from '@/components/Public/PublicFooter'
import PublicHeader from '@/components/Public/PublicHeader'
import PublicNavbar from '@/components/Public/PublicNavbar'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--white-gray)] overflow-hidden">
      <PublicHeader />
      <PublicNavbar />
      
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 relative">
        {/* Decorative Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)] opacity-20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-[800px] w-full z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mb-8"
          >
            <motion.div
              animate={{ 
                y: [0, -15, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Image
                src="/premium_404_illustration_1775914067450.png"
                alt="404 Illustration"
                width={400}
                height={400}
                className="w-full max-w-[350px] mx-auto drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-6xl md:text-8xl font-black text-[var(--customRedColor)] mb-4 tracking-tighter">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-secondary)] mb-6">
              Oops! You've wandered off the track.
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
              We couldn't find the page you're looking for. It might have been moved or doesn't exist anymore.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[var(--customRedColor)] text-[var(--customRedColor)] font-bold hover:bg-[var(--customRedColor)] hover:text-white transition-all duration-300"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
            <Link
              href="/home"
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--customRedColor)] text-white font-bold hover:shadow-lg hover:brightness-110 transition-all duration-300"
            >
              <Home size={18} />
              Return Home
            </Link>
          </motion.div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}

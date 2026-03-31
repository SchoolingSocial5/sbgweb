'use client'
import Image from 'next/image'
import { useTheme } from '@/context/ThemeProvider'

interface NotFoundProps {
  message: string
}

export default function NotFound({ message }: NotFoundProps) {
  const { theme } = useTheme()
  return (
    <>
      <div className="max-w-[1000px] relative flex flex-col items-center w-full pb-3">
        <div className="w-[300px] h-[250px] sm:w-[400px] sm:h-[300px]">
          <Image
            src={
              theme === 'dark'
                ? `/images/NotFoundDark.png`
                : '/images/NotFoundLight.png'
            }
            alt="Media"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-center text-[25px] sm:text-[40px] text-[var(--text-secondary)]">
          {message}
        </div>
      </div>
    </>
  )
}

import React from 'react'
import Image from 'next/image'

interface SpinnerProps {
  size: number
}

const Spinner: React.FC<SpinnerProps> = ({ size }) => {
  return (
    <Image
      src="/Spinner.gif"
      alt="Media"
      width={0}
      sizes="100vw"
      height={0}
      style={{ width: size, height: size }}
      className="object-contain"
    />
  )
}
export default Spinner

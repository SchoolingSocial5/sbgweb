import { useEffect, useState } from 'react'

function formatCountdown(ms: number) {
  if (ms < 0) ms = 0

  const d = Math.floor(ms / (1000 * 60 * 60 * 24))
  const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((ms % (1000 * 60)) / 1000)

  return { d, h, m, s }
}

export const CountdownCell = ({ startingTime }: { startingTime: number }) => {
  const [timeLeft, setTimeLeft] = useState(startingTime)

  useEffect(() => {
    if (!startingTime) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1000 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [startingTime])

  const { d, h, m, s } = formatCountdown(timeLeft)

  return (
    <td className="text-sm">
      {d}d : {h}h : {m}m : {s}s
    </td>
  )
}

export const CountdownCellExam = ({
  startingTime,
}: {
  startingTime: number
}) => {
  const [timeLeft, setTimeLeft] = useState(startingTime)

  useEffect(() => {
    if (!startingTime) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1000 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [startingTime])

  const { d, h, m, s } = formatCountdown(timeLeft)

  return (
    <td className="text-sm">
      {d}d : {h}h : {m}m : {s}s
    </td>
  )
}

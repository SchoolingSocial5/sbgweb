
'use client'
import React from 'react'

interface StatDurationProps {
  title: string
  fromDate: Date
  toDate: Date
  setFromDate: (date: Date) => void
  setToDate: (date: Date) => void
}

const StatDuration: React.FC<StatDurationProps> = ({
  title,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
}) => {
  // Format date for <input type="datetime-local" /> (respecting timezone)
  const toLocalInputValue = (date?: Date) => {
    if (!date) return ''
    const tzOffset = date.getTimezoneOffset() * 60000
    const localISOTime = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16)
    return localISOTime
  }

  const handleFromChange = (value: string) => {
    const date = new Date(value)
    if (
      date.getHours() === 0 &&
      date.getMinutes() === 0 &&
      date.getSeconds() === 0
    ) {
      date.setHours(0, 0, 0, 0)
    }
    setFromDate(date)
  }

  const handleToChange = (value: string) => {
    const date = new Date(value)
    if (
      date.getHours() === 0 &&
      date.getMinutes() === 0 &&
      date.getSeconds() === 0
    ) {
      date.setHours(23, 59, 59, 999)
    }
    setToDate(date)
  }

  return (
    <div className="flex flex-wrap items-start lg:items-center mb-3 text-[var(--text-secondary)]">
      <div className="pageTitle mb-1 sm:mb-0">{title}</div>

      <div className="grid grid-cols-2 gap-2 ml-auto">
        {/* From Date */}
        <label
          htmlFor="from"
          className="statDuration start cursor-pointer flex items-center"
        >
          <input
            id="from"
            type="datetime-local"
            value={toLocalInputValue(fromDate)}
            onChange={(e) => handleFromChange(e.target.value)}
            className="border-none outline-none bg-transparent"
          />
        </label>

        {/* To Date */}
        <label
          htmlFor="to"
          className="statDuration start cursor-pointer flex items-center"
        >
          <input
            id="to"
            type="datetime-local"
            value={toLocalInputValue(toDate)}
            onChange={(e) => handleToChange(e.target.value)}
            className="border-none outline-none bg-transparent"
          />
        </label>
      </div>
    </div>
  )
}

export default StatDuration

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
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-[var(--text-secondary)]">
      <div className="pageTitle min-w-fit">{title}</div>

      <div className="flex flex-wrap items-center gap-3 ml-auto w-full sm:w-auto justify-end">
        <div className="flex gap-2 w-full sm:w-auto overflow-auto">
          {/* From Date */}
          <label
            htmlFor="from"
            className="statDuration flex-1 sm:flex-initial cursor-pointer flex items-center justify-center bg-[var(--primary)] text-xs"
          >
            <input
              id="from"
              type="datetime-local"
              value={toLocalInputValue(fromDate)}
              onChange={(e) => handleFromChange(e.target.value)}
              className="border-none outline-none bg-transparent py-1 text-xs w-full"
            />
          </label>

          {/* To Date */}
          <label
            htmlFor="to"
            className="statDuration flex-1 sm:flex-initial cursor-pointer flex items-center justify-center bg-[var(--primary)] text-xs"
          >
            <input
              id="to"
              type="datetime-local"
              value={toLocalInputValue(toDate)}
              onChange={(e) => handleToChange(e.target.value)}
              className="border-none outline-none bg-transparent py-1 text-xs w-full"
            />
          </label>
        </div>
      </div>
    </div>
  )
}

export default StatDuration

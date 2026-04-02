
'use client'
import React from 'react'

interface StatDurationProps {
  title: string
  fromDate: Date
  toDate: Date
  setFromDate: (date: Date) => void
  setToDate: (date: Date) => void
  period?: string
  setPeriod?: (period: string) => void
}

const StatDuration: React.FC<StatDurationProps> = ({
  title,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  period,
  setPeriod,
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
    if (setPeriod) setPeriod('')
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
    if (setPeriod) setPeriod('')
  }

  const handlePeriodChange = (val: string) => {
    if (!setPeriod) return
    setPeriod(val)

    const now = new Date()
    let from = new Date(now)
    let to = new Date(now)

    switch (val) {
      case 'Daily':
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break

      case 'Weekly': {
        const day = now.getDay() // 0 = Sunday, 1 = Monday...
        const diffToMonday = day === 0 ? 6 : day - 1
        from.setDate(now.getDate() - diffToMonday)
        from.setHours(0, 0, 0, 0)

        to = new Date(from)
        to.setDate(from.getDate() + 6)
        to.setHours(23, 59, 59, 999)
        break
      }

      case 'Monthly':
        from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        break

      case 'Yearly':
        from = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
        to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
        break

      default:
        return
    }

    setFromDate(from)
    setToDate(to)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-[var(--text-secondary)]">
      <div className="pageTitle min-w-fit">{title}</div>

      <div className="flex flex-wrap items-center gap-3 ml-auto w-full sm:w-auto justify-end">
        {setPeriod && (
          <div className="relative group min-w-[120px]">
             <select 
              value={period} 
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="statDuration w-full appearance-none cursor-pointer border-none bg-[var(--primary)] py-2 px-3 text-sm focus:ring-0"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              {period === '' && <option value="">Custom</option>}
            </select>
            <i className="bi bi-caret-down-fill absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs opacity-50"></i>
          </div>
        )}

        <div className="flex gap-2 w-full sm:w-auto overflow-auto">
          {/* From Date */}
          <label
            htmlFor="from"
            className="statDuration flex-1 sm:flex-initial cursor-pointer flex items-center justify-center bg-[var(--primary)]"
          >
            <input
              id="from"
              type="datetime-local"
              value={toLocalInputValue(fromDate)}
              onChange={(e) => handleFromChange(e.target.value)}
              className="border-none outline-none bg-transparent py-1 text-sm w-full"
            />
          </label>

          {/* To Date */}
          <label
            htmlFor="to"
            className="statDuration flex-1 sm:flex-initial cursor-pointer flex items-center justify-center bg-[var(--primary)]"
          >
            <input
              id="to"
              type="datetime-local"
              value={toLocalInputValue(toDate)}
              onChange={(e) => handleToChange(e.target.value)}
              className="border-none outline-none bg-transparent py-1 text-sm w-full"
            />
          </label>
        </div>
      </div>
    </div>
  )
}

export default StatDuration


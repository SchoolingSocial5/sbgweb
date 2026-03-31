'use client'
import React, { useRef } from 'react'
import { Calendar } from 'lucide-react'

interface FinanceDurationProps {
    title: string
    fromDate: Date
    toDate: Date
    setFromDate: (date: Date) => void
    setToDate: (date: Date) => void
}

const FinanceDuration: React.FC<FinanceDurationProps> = ({
    title,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
}) => {

    const fromRef = useRef<HTMLInputElement>(null)
    const toRef = useRef<HTMLInputElement>(null)

    // Format date for datetime-local respecting timezone
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

    const openFromPicker = () => {
        fromRef.current?.showPicker()
    }

    const openToPicker = () => {
        toRef.current?.showPicker()
    }

    return (
        <div className="flex flex-wrap items-start lg:items-center mb-3 text-[var(--text-secondary)]">
            <div className="pageTitle mb-1 sm:mb-0">{title}</div>

            <div className="flex gap-3 ml-auto">

                <div
                    onClick={openFromPicker}
                    className="statDuration relative overflow-hidden cursor-pointer flex items-center gap-2"
                >
                    <span className="mr-2">From:</span>
                    <Calendar size={18} />

                    <input
                        ref={fromRef}
                        type="datetime-local"
                        value={toLocalInputValue(fromDate)}
                        onChange={(e) => handleFromChange(e.target.value)}
                        className="absolute inset-0 opacity-0"
                    />
                </div>

                <div
                    onClick={openToPicker}
                    className="statDuration relative overflow-hidden cursor-pointer flex items-center gap-2"
                >
                    <span className="mr-2">To:</span>
                    <Calendar size={18} />

                    <input
                        ref={toRef}
                        type="datetime-local"
                        value={toLocalInputValue(toDate)}
                        onChange={(e) => handleToChange(e.target.value)}
                        className="absolute inset-0 opacity-0"
                    />
                </div>

            </div>
        </div>
    )
}

export default FinanceDuration
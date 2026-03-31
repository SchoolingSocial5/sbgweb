'use client'

import { useTheme } from '@/context/ThemeProvider'
import TransactionStore from '@/src/zustand/Transaction'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts'

export default function BarGraphSales() {
  const { theme } = useTheme()
  const { bars } = TransactionStore()

  return (
    <>
      <h2 className="mb-2 text-lg font-semibold">Sales vs Purchases</h2>

      <ResponsiveContainer
        className="bg-[var(--secondary)] text-gray-400 pt-2 rounded-[5px]"
        width="100%"
        height={300}
      >
        <BarChart data={bars} barGap={6}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === 'dark' ? '#444' : '#ddd'}
          />
          <XAxis
            dataKey="date"
            stroke={theme === 'dark' ? '#ccc' : '#9ca3af'}
            tickFormatter={(val) => val.replace('2025-', '')} // cleaner labels like 10-27
          />
          <YAxis stroke={theme === 'dark' ? '#ccc' : '#9ca3af'} />
          <Tooltip
            formatter={(value: number) => value.toLocaleString()}
            labelFormatter={(label) => `Period: ${label}`}
          />
          <Legend />
          <Bar
            dataKey="totalSales"
            fill="#0cc042"
            name="Sales"
            radius={[5, 5, 0, 0]}
          />
          <Bar
            dataKey="totalPurchases"
            fill="#F35329"
            name="Purchases"
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

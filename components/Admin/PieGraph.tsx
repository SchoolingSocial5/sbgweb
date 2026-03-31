// 'use client'
// import TransactionStore from '@/src/zustand/Transaction'
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from 'recharts'

// const COLORS = ['#0cc042', '#F35329'] // Sales and Purchases colors

// export default function PieGraph() {
//   const { totals } = TransactionStore()

//   const { totalSales = 0, totalPurchases = 0 } = totals || {}

//   const pieData = [
//     { name: 'Sales', value: totalSales },
//     { name: 'Purchases', value: totalPurchases },
//   ].filter((item) => item.value > 0)

//   const renderCustomizedLabel = ({
//     cx,
//     cy,
//     midAngle,
//     innerRadius,
//     outerRadius,
//     name,
//     value,
//   }: any) => {
//     const radius = innerRadius + (outerRadius - innerRadius) / 2
//     const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
//     const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))

//     return (
//       <text
//         x={x}
//         y={y}
//         fill="white"
//         textAnchor="middle"
//         dominantBaseline="central"
//         fontSize={12}
//       >
//         {`${name}`}
//         <tspan x={x} dy="1.2em" fontSize={11} fill="#fff">
//           ₦{value.toLocaleString('en-NG')}
//         </tspan>
//       </text>
//     )
//   }

//   return (
//     <div className="flex flex-col items-center">
//       <h2 className="mb-2 text-lg font-semibold">
//         Sales vs Purchases Overview
//       </h2>

//       <ResponsiveContainer width="100%" height={320}>
//         <PieChart>
//           <Pie
//             data={pieData}
//             cx="50%"
//             cy="50%"
//             outerRadius={90}
//             dataKey="value"
//             labelLine={false}
//             label={renderCustomizedLabel}
//           >
//             {pieData.map((entry, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={COLORS[index % COLORS.length]}
//               />
//             ))}
//           </Pie>

//           <Tooltip
//             formatter={(value: number) =>
//               new Intl.NumberFormat('en-NG', {
//                 style: 'currency',
//                 currency: 'NGN',
//               }).format(value)
//             }
//           />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   )
// }
'use client'
import TransactionStore from '@/src/zustand/Transaction'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieLabelRenderProps,
} from 'recharts'

const COLORS = ['#0cc042', '#F35329'] // Sales and Purchases colors

export default function PieGraph() {
  const { totals } = TransactionStore()

  const { totalSales = 0, totalPurchases = 0 } = totals || {}

  const pieData = [
    { name: 'Sales', value: totalSales },
    { name: 'Purchases', value: totalPurchases },
  ].filter((item) => item.value > 0)

  // ✅ Strongly typed label renderer (no any)
  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, name, value } = props

    if (
      cx === undefined ||
      cy === undefined ||
      innerRadius === undefined ||
      outerRadius === undefined ||
      name === undefined ||
      value === undefined
    )
      return null

    const radius =
      Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) / 2
    const x = Number(cx) + radius * Math.cos(-midAngle * (Math.PI / 180))
    const y = Number(cy) + radius * Math.sin(-midAngle * (Math.PI / 180))

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
      >
        {name}
        <tspan x={x} dy="1.2em" fontSize={11} fill="#fff">
          ₦{Number(value).toLocaleString('en-NG')}
        </tspan>
      </text>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-lg font-semibold">
        Sales vs Purchases Overview
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
              }).format(value)
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

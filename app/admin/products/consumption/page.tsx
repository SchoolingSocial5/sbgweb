'use client'
import ProductTable from '@/components/Admin/Pages/ProductTable'

export default function ConsumptionProducts() {
  return (
    <ProductTable 
      filterType={['Feed', 'Medicine', 'Water']} 
      showStock={true}
      showPrice={false}
      title="Consumption Products" 
    />
  )
}

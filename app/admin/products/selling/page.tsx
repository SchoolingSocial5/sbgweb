'use client'
import ProductTable from '@/components/Admin/Pages/ProductTable'

export default function SellingProducts() {
  return (
    <ProductTable 
      isSelling={true} 
      showStock={true}
      title="Selling Products" 
    />
  )
}

'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatMoney } from '@/lib/helpers'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import ProductStore, { Product } from '@/src/zustand/Product'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { Edit, Trash, ShoppingCart } from 'lucide-react'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import BuyProductForm from './PopUps/BuyProductForm'

interface BuyingProductTableProps {
  type?: 'Feed' | 'Medicine' | 'Livestock'
}

const BuyingProductTable: React.FC<BuyingProductTableProps> = ({ type }) => {
  const {
    getBuyingProducts,
    getFeeds,
    getMedicines,
    getLivestock,
    setToBuyCart,
    createTransaction,
    updateBuyingCartUnits,
    updateBuyingProducts,
    count,
    feedsCount,
    medicinesCount,
    livestockCount,
    buyingProducts,
    feeds,
    medicines,
    livestockProducts,
    showBuyProductForm,
    setShowBuyProductForm,
    setForm,
    resetForm,
    loading,
    deleteItem,
    setLoading,
    setIsPurchaseMode,
  } = ProductStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const pathname = usePathname()
  const { page } = useParams()
  const { setAlert } = AlartStore()
  const url = '/products'

  useEffect(() => {
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}&isBuyable=${true}${type ? `&type=${type}` : ''}`
    
    if (type === 'Feed') {
      getFeeds(`${url}${params}`, setMessage)
    } else if (type === 'Medicine') {
      getMedicines(`${url}${params}`, setMessage)
    } else if (type === 'Livestock') {
      getLivestock(`${url}${params}`, setMessage)
    } else {
      getBuyingProducts(`${url}${params}`, setMessage)
    }
  }, [page, pathname, type, getBuyingProducts, getFeeds, getLivestock, getMedicines, page_size, setMessage, sort, url])

  const deleteProduct = async (id: string) => {
    const params = `?page_size=${page_size}&page=${page ? page : 1}&ordering=${sort}&isBuyable=${true}${type ? `&type=${type}` : ''}`
    await deleteItem(`${url}/${id}/${params}`, setMessage, setLoading)
  }

  const startDelete = (id: string) => {
    setAlert(
      'Warning',
      'Are you sure you want to delete this product?',
      true,
      () => deleteProduct(id)
    )
  }

  const localProducts = type === 'Feed' ? feeds : 
                        type === 'Medicine' ? medicines : 
                        type === 'Livestock' ? livestockProducts : 
                        buyingProducts.filter(p => ['Feed', 'Medicine', 'Water'].includes(p.type));

  const localCount = type === 'Feed' ? feedsCount : 
                     type === 'Medicine' ? medicinesCount : 
                     type === 'Livestock' ? livestockCount : 
                     localProducts.length;

  const handleSubmit = async (e: string, product: Product) => {
    if (!user) {
      setMessage('Please logout and login to continue.', false)
      return
    }

    const data = {
      product: product,
      staffName: user.fullName,
      supName: product.supName,
      supAddress: product.supAddress,
      supPhone: product.supPhone,
      picture: user.picture,
      totalAmount: product.cartUnits * product.costPrice,
      payment: e,
      remark: product.remark,
      isProfit: false,
      status: true,
    }

    createTransaction(
      `/transactions/purchase?isBuyable=false&ordering=name`,
      data,
      setMessage,
      () => {
        updateBuyingProducts()
      }
    )
  }

  const handleExport = () => {
    if (localProducts.length === 0) {
      setMessage('No records to export.', false)
      return
    }

    const headers = ['S/N', 'Product Name', 'Type', 'Supplier', 'Phone', 'Cost Price', 'Units in Stock']
    const rows = localProducts.map((item, index) => [
      String(index + 1),
      item.name,
      item.type,
      item.supName,
      item.supPhone,
      String(item.costPrice),
      String(item.units)
    ])

    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `Purchases_${type || 'All'}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setMessage('Product data exported successfully!', true)
  }

  return (
    <>
      <div className="card_body sharp mb-3 flex items-center flex-wrap justify-between font-bold text-sm tracking-wide opacity-70">
        Purchase Transactions ({type || 'General'})
      </div>

      <div className="overflow-auto mb-5 card_body sharp">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[var(--primary)] text-left">
              <th className="p-3 whitespace-nowrap text-sm">S/N</th>
              <th className="p-3 whitespace-nowrap text-sm">Image</th>
              <th className="p-3 whitespace-nowrap text-sm">Product Name</th>
              <th className="p-3 whitespace-nowrap text-sm">Type</th>
              <th className="p-3 whitespace-nowrap text-right text-sm">Price (₦)</th>
              <th className="p-3 whitespace-nowrap text-sm">Supplier</th>
              <th className="p-3 whitespace-nowrap text-right text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {localProducts.map((item, index) => (
              <tr 
                key={index} 
                className={`border-b border-[var(--border)] hover:bg-[var(--secondary)] transition-colors ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
              >
                <td className="p-3 text-sm">
                  {(page ? Number(page) - 1 : 1 - 1) * page_size + index + 1}
                </td>
                <td className="p-3">
                  <div className="relative w-[60px] h-[45px] overflow-hidden rounded-[4px] border border-[var(--border)]">
                    {item.picture ? (
                      <Image
                        alt={item.name}
                        src={item.picture ? String(item.picture) : '/images/page-header.jpg'}
                        fill
                        sizes="60px"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center text-[10px] text-[var(--text-secondary)]">N/A</div>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-semibold text-[var(--customColor)] leading-tight">{item.name}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] line-clamp-1 opacity-70">{item.seoTitle}</div>
                </td>
                <td className="p-3">
                  <div className="font-medium text-[var(--text-secondary)]">
                    {item.type}
                  </div>
                </td>
                <td className="p-3 text-right font-medium">
                  {formatMoney(item.costPrice)}
                </td>
                <td className="p-3 leading-tight">
                  <div className="font-medium">{item.supName}</div>
                  <div className="text-[var(--text-secondary)]">{item.supPhone}</div>
                </td>
                <td className="p-3 text-right">
                  <div
                    onClick={() => {
                      resetForm()
                      setForm('_id', item._id)
                      setIsPurchaseMode(true)
                      ProductStore.setState({ productForm: { ...item, cartUnits: 1 } })
                      setShowBuyProductForm(true)
                    }}
                    className="inline-flex p-2 text-green-600 hover:bg-[var(--secondary)] rounded-full transition-colors cursor-pointer"
                    title="Purchase this product"
                  >
                    <ShoppingCart size={18} />
                  </div>
                  <div
                    onClick={() => {
                        resetForm()
                        setForm('_id', item._id) // Just to be sure, though setForm can handle object merge if I use ProductStore.setState
                        ProductStore.setState({ productForm: item })
                        setIsPurchaseMode(false)
                        setShowBuyProductForm(true)
                    }}
                    className="inline-flex p-2 text-[var(--customColor)] hover:bg-[var(--secondary)] rounded-full transition-colors cursor-pointer"
                  >
                    <Edit size={18} />
                  </div>
                  <div
                    onClick={() => startDelete(item._id)}
                    className="inline-flex p-2 text-[var(--customRedColor)] hover:bg-[var(--secondary)] rounded-full transition-colors cursor-pointer"
                  >
                    <Trash size={18} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card_body sharp mb-3">
        <div className="flex flex-wrap items-center">
          <div className="grid mr-auto grid-cols-4 gap-2 w-[120px]">
            <div
              onClick={() => {
                resetForm()
                setForm('type', type || 'General')
                setForm('isBuyable', true)
                setShowBuyProductForm(true)
              }}
              className="tableActions"
              title="Add New Product"
            >
              <i className="bi bi-plus-circle"></i>
            </div>
            <div
              onClick={handleExport}
              className="tableActions !bg-green-600 !text-white border-none"
              title="Export to Excel"
            >
              <i className="bi bi-file-earmark-excel"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="card_body sharp">
        <LinkedPagination
          url={pathname}
          count={localCount}
          page_size={20}
        />
      </div>

      {showBuyProductForm && <BuyProductForm />}
    </>
  )
}

export default BuyingProductTable

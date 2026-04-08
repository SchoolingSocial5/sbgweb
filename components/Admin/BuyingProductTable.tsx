'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatMoney } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import ProductStore, { Product } from '@/src/zustand/Product'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { Edit } from 'lucide-react'
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
  } = ProductStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const pathname = usePathname()
  const { page } = useParams()
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

  const localProducts = type === 'Feed' ? feeds : 
                        type === 'Medicine' ? medicines : 
                        type === 'Livestock' ? livestockProducts : 
                        buyingProducts;

  const localCount = type === 'Feed' ? feedsCount : 
                     type === 'Medicine' ? medicinesCount : 
                     type === 'Livestock' ? livestockCount : 
                     count;

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
              <th className="p-3 whitespace-nowrap text-center text-sm">Purchase</th>
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
                <td className="p-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center mb-1">
                      <div
                        onClick={() => setToBuyCart(item, false)}
                        className="flex justify-center h-[28px] w-[28px] cursor-pointer items-center bg-[var(--secondary)] border border-[var(--border)] rounded-l"
                      >
                        <i className="bi bi-dash"></i>
                      </div>
                      <input
                        value={item.cartUnits ?? 0}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (isNaN(value) || value < 0) return
                          updateBuyingCartUnits(item._id, value)
                        }}
                        className="bg-[var(--primary)] w-[60px] h-[28px] text-center outline-none border-y border-[var(--border)] font-semibold text-sm"
                        type="number"
                      />
                      <div
                        onClick={() => setToBuyCart(item, true)}
                        className="flex justify-center h-[28px] w-[28px] cursor-pointer items-center bg-[var(--secondary)] border border-[var(--border)] rounded-r"
                      >
                        <i className="bi bi-plus"></i>
                      </div>
                    </div>
                    
                    {item.cartUnits > 0 && (
                      <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <textarea
                          value={item.remark ?? ''}
                          onChange={(e) => {
                            const remark = e.target.value
                            ProductStore.setState((prev) => ({
                              buyingProducts: prev.buyingProducts.map((p) =>
                                p._id === item._id ? { ...p, remark } : p
                              ),
                              feeds: prev.feeds.map((p) =>
                                p._id === item._id ? { ...p, remark } : p
                              ),
                              medicines: prev.medicines.map((p) =>
                                p._id === item._id ? { ...p, remark } : p
                              ),
                              livestockProducts: prev.livestockProducts.map((p) =>
                                p._id === item._id ? { ...p, remark } : p
                              ),
                            }))
                          }}
                          placeholder="Remark..."
                          className="w-full text-xs p-1 bg-[var(--secondary)] border border-[var(--border)] rounded outline-none h-[40px] resize-none"
                        />
                        <div className="flex justify-center gap-1">
                          <button
                            disabled={loading}
                            onClick={() => handleSubmit('Transfer', item)}
                            className={`px-2 py-1 bg-[var(--success)] text-white text-[10px] rounded hover:opacity-90 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            TX
                          </button>
                          <button
                            disabled={loading}
                            onClick={() => handleSubmit('Cash', item)}
                            className={`px-2 py-1 bg-[var(--customRedColor)] text-white text-[10px] rounded hover:opacity-90 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            CH
                          </button>
                          <button
                            disabled={loading}
                            onClick={() => handleSubmit('POS', item)}
                            className={`px-2 py-1 bg-[var(--customColor)] text-white text-[10px] rounded hover:opacity-90 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            PS
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div
                    onClick={() => {
                        setForm('_id', item._id) // Just to be sure, though setForm can handle object merge if I use ProductStore.setState
                        ProductStore.setState({ productForm: item })
                        setShowBuyProductForm(true)
                    }}
                    className="inline-flex p-2 text-[var(--customColor)] hover:bg-[var(--secondary)] rounded-full transition-colors cursor-pointer"
                  >
                    <Edit size={18} />
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

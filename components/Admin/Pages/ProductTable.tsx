'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatMoney } from '@/lib/helpers'
import _debounce from 'lodash/debounce'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { Edit, Trash } from 'lucide-react'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import ProductStore from '@/src/zustand/Product'
import StockingStore from '@/src/zustand/Stocking'
import StockingForm from '../PopUps/StockingForm'
import ProductForm from '../PopUps/ProductForm'
import BuyProductForm from '../PopUps/BuyProductForm'
import EggMortalityForm from '../PopUps/EggMortalityForm'
import { Product, ProductEmpty } from '@/src/zustand/Product'

interface ProductTableProps {
  filterType?: string[]
  isSelling?: boolean
  showStock?: boolean
  showPrice?: boolean
  title?: string
}

const ProductTable: React.FC<ProductTableProps> = ({ 
  filterType, 
  isSelling, 
  showStock, 
  showPrice = true, 
  title = 'Product Records' 
}) => {
  const {
    getProducts,
    massDelete,
    deleteItem,
    toggleAllSelected,
    toggleChecked,
    setLoading,
    toggleActive,
    reshuffleResults,
    searchProducts,
    searchedProducts,
    isAllChecked,
    selectedProducts,
    loading,
    count,
    products,
    showProductForm,
    setShowProductForm,
    showBuyProductForm,
    setShowBuyProductForm,
    setForm,
    resetForm,
  } = ProductStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { page } = useParams()
  const { setAlert } = AlartStore()
  const { showStocking } = StockingStore()
  const [showEggMortality, setShowEggMortality] = useState(false)
  const [selectedEggProduct, setSelectedEggProduct] = useState<Product | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const url = '/products'
  
  const filterParams = () => {
    let p = ''
    if (filterType && filterType.length > 0) {
      p += `&type[in]=${filterType.join(',')}`
    }
    if (isSelling !== undefined) {
      p += `&isSelling=${isSelling}`
    }
    return p
  }

  const params = `?page_size=${page_size}&page=${page ? page : 1}&ordering=${sort}${filterParams()}`

  useEffect(() => {
    reshuffleResults()
  }, [pathname, reshuffleResults])

  useEffect(() => {
    getProducts(`${url}${params}`, setMessage)
  }, [page, pathname, params])

  const deleteProduct = async (id: string, index: number) => {
    toggleActive(index)
    await deleteItem(`${url}/${id}/${params}`, setMessage, setLoading)
  }

  const startDelete = (id: string, index: number) => {
    setAlert(
      'Warning',
      'Are you sure you want to delete this product?',
      true,
      () => deleteProduct(id, index)
    )
  }

  const handlesearchProducts = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value.trim().length > 0) {
        searchProducts(
          `${url}/search?name=${value}&description=${value}&title=${value}&page_size=${page_size}${filterParams()}`
        )
      } else {
        ProductStore.setState({ searchedProducts: [] })
      }
    },
    1000
  )

  const DeleteItems = async () => {
    if (selectedProducts.length === 0) {
      setMessage('Please select at least one product to delete', false)
      return
    }
    const ids = selectedProducts.map((item) => item._id)
    await massDelete(`${url}/mass-delete`, { ids: ids }, setMessage)
  }


  return (
    <>
      <div className="card_body sharp mb-5">
        <div className="text-lg text-[var(--text-secondary)]">
          Table of {title}
        </div>
        <div className="relative mb-2">
          <div className={`input_wrap ml-auto active `}>
            <input
              ref={inputRef}
              type="search"
              onChange={handlesearchProducts}
              className={`transparent-input flex-1 `}
              placeholder={`Search ${title.toLowerCase()}`}
            />
            {loading ? (
              <i className="bi bi-opencollective common-icon loading"></i>
            ) : (
              <i className="bi bi-search common-icon cursor-pointer"></i>
            )}
          </div>

          {searchedProducts.length > 0 && (
            <div
              className={`dropdownList ${searchedProducts.length > 0
                ? 'overflow-auto'
                : 'overflow-hidden h-0'
                }`}
            >
              {searchedProducts.map((item, index) => (
                <div key={index} className="input_drop_list">
                  <Link href={`/admin/products/${item._id}`} className="flex-1">
                    {item.name}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-auto mb-5 card_body sharp py-0 px-0">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[var(--primary)] text-left border-b border-[var(--border)]">
              <th className="p-4 text-base font-bold w-[100px]">
                <div className="flex items-center">
                  <div onClick={toggleAllSelected} className="tableActions mb-0 cursor-pointer w-6 h-6 flex items-center justify-center mr-3">
                    <i className={`bi bi-check2-all ${isAllChecked ? 'text-[var(--custom)]' : ''}`}></i>
                  </div>
                  S/N
                </div>
              </th>
              <th className="p-4 text-base font-bold w-[80px]">Image</th>
              <th className="p-4 text-base font-bold">Product Name</th>
              <th className="p-4 text-base font-bold text-right">Cost Price (₦)</th>
              {showPrice && (
                <th className="p-4 text-base font-bold text-right">Selling Price (₦)</th>
              )}
              {showStock && (
                <th className="p-4 text-base font-bold text-right w-[100px]">Stock</th>
              )}
              <th className="p-4 text-base font-bold text-right w-[120px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => (
              <tr 
                key={index} 
                className={`border-b border-[var(--border)] hover:bg-[var(--secondary)] transition-colors ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
              >
                <td className="p-3 text-sm">
                  <div className="flex items-center">
                    <div
                      className={`checkbox mr-3 ${item.isChecked ? 'active' : ''}`}
                      onClick={() => toggleChecked(index)}
                    >
                      {item.isChecked && (
                        <i className="bi bi-check text-white text-lg"></i>
                      )}
                    </div>
                    {(page ? Number(page) - 1 : 1 - 1) * page_size + index + 1}
                  </div>
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
                  <div className="font-medium text-[var(--customColor)] leading-tight">{item.name}</div>
                </td>
                <td className="p-3 text-right font-medium">
                  {formatMoney(item.costPrice)}
                </td>
                {showPrice && (
                  <td className="p-3 text-right font-medium">
                    {formatMoney(item.price || item.costPrice)}
                  </td>
                )}
                {showStock && (
                  <td className="p-3 text-right font-medium text-[var(--text-secondary)]">
                    {item.units} {item.consumptionUnit || 'units'}
                  </td>
                )}
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-3 text-[var(--customColor)]">
                    {item.name.toLowerCase().includes('egg') && (
                      <div
                        onClick={() => {
                          setSelectedEggProduct(item)
                          setShowEggMortality(true)
                        }}
                        className="cursor-pointer text-[var(--customRedColor)] hover:opacity-80 transition-opacity"
                        title="Record Egg Damage / Mortality"
                      >
                        <i className="bi bi-shield-exclamation text-lg"></i>
                      </div>
                    )}
                    <div
                      onClick={() => {
                        resetForm()
                        setForm('_id', item._id)
                        ProductStore.setState({ productForm: { ...ProductEmpty, ...item } })
                        if (item.isSelling) {
                          setShowProductForm(true)
                        } else if (item.isBuyable) {
                          setShowBuyProductForm(true)
                        } else {
                          setShowProductForm(true)
                        }
                      }}
                      className="cursor-pointer hover:text-[var(--custom)] transition-colors"
                    >
                      <Edit size={18} />
                    </div>
                    <Trash
                      className="cursor-pointer text-[var(--customRedColor)] hover:opacity-80"
                      onClick={() => startDelete(item._id, index)}
                      size={18}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="flex w-full justify-center py-5">
          <i className="bi bi-opencollective loading"></i>
        </div>
      )}

      <div className="card_body sharp mb-3">
        <div className="flex flex-wrap items-center">
          <div className="grid mr-auto grid-cols-4 gap-2 w-[160px]">
            <div onClick={toggleAllSelected} className="tableActions">
              <i
                className={`bi bi-check2-all ${isAllChecked ? 'text-[var(--custom)]' : ''
                  }`}
              ></i>
            </div>

            <div onClick={DeleteItems} className="tableActions">
              <i className="bi bi-trash"></i>
            </div>
            <div
              onClick={() => {
                resetForm()
                if (isSelling) setForm('isSelling', true)
                if (filterType && filterType.length === 1) setForm('type', filterType[0] as any)
                setShowProductForm(true)
              }}
              className="tableActions cursor-pointer"
            >
              <i className="bi bi-plus-circle"></i>
            </div>
            <Link
              href={`/admin/products/create-buy-product`}
              className="tableActions"
            >
              <i className="bi bi-backpack"></i>
            </Link>
          </div>
        </div>
      </div>

      {showStocking && <StockingForm />}
      {showProductForm && <ProductForm />}
      {showBuyProductForm && <BuyProductForm />}
      {showEggMortality && selectedEggProduct && (
        <EggMortalityForm 
          product={selectedEggProduct} 
          onClose={() => {
            setShowEggMortality(false)
            setSelectedEggProduct(null)
          }} 
        />
      )}

      <div className="card_body sharp">
        <LinkedPagination url={pathname} count={count} page_size={20} />
      </div>
    </>
  )
}

export default ProductTable

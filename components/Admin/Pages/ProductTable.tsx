'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatMoney } from '@/lib/helpers'
import _debounce from 'lodash/debounce'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { Edit, Package, Trash } from 'lucide-react'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import ProductStore, { Product } from '@/src/zustand/Product'
import StockingStore from '@/src/zustand/Stocking'
import StockingForm from '../PopUps/StockingForm'

const ProductTable: React.FC = () => {
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
  } = ProductStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { page } = useParams()
  const { setAlert } = AlartStore()
  const { showStocking, setShowStocking } = StockingStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const url = '/products'
  const params = `?page_size=${page_size}&page=${page ? page : 1
    }&ordering=${sort}`

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    if (products.length === 0) {
      getProducts(`${url}${params}`, setMessage)
    }
  }, [page])

  const deleteProduct = async (id: string, index: number) => {
    toggleActive(index)
    await deleteItem(`${url}/${id}/${params}`, setMessage, setLoading)
  }

  const startDelete = (id: string, index: number) => {
    setAlert(
      'Warning',
      'Are you sure you want to delete this news?',
      true,
      () => deleteProduct(id, index)
    )
  }

  const handlesearchProducts = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value.trim().length > 0) {
        searchProducts(
          `${url}/search?name=${value}&description=${value}&title=${value}&page_size=${page_size}`
        )
      } else {
        ProductStore.setState({ searchedProducts: [] })
      }
    },
    1000
  )

  const DeleteItems = async () => {
    if (selectedProducts.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    const ids = selectedProducts.map((item) => item._id)
    await massDelete(`${url}/mass-delete`, { ids: ids }, setMessage)
  }

  const setStockingForm = (stock: Product) => {
    StockingStore.setState((prev) => {
      return {
        stockingFrom: {
          ...prev.stockingFrom,
          name: stock.name,
          productId: stock._id,
          amount: stock.costPrice,
          picture: String(stock.picture),
        },
      }
    })
    setShowStocking(true)
  }

  return (
    <>
      <div className="card_body sharp mb-5">
        <div className="text-lg text-[var(--text-secondary)]">
          Table of Products
        </div>
        <div className="relative mb-2">
          <div className={`input_wrap ml-auto active `}>
            <input
              ref={inputRef}
              type="search"
              onChange={handlesearchProducts}
              className={`transparent-input flex-1 `}
              placeholder="Search products"
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

      {products.map((item, index) => (
        <div key={index} className="card_body sharp mb-1">
          <div className="">
            <div className="flex flex-wrap sm:flex-nowrap relative items-start mb-3 sm:mb-1">
              <div className="flex items-center mr-3">
                <div
                  className={`checkbox ${item.isChecked ? 'active' : ''}`}
                  onClick={() => toggleChecked(index)}
                >
                  {item.isChecked && (
                    <i className="bi bi-check text-white text-lg"></i>
                  )}
                </div>
                {(page ? Number(page) - 1 : 1 - 1) * page_size + index + 1}
              </div>
              <div className="relative w-[150px] flex justify-center h-[100px] sm:h-[50] sm:w-[100] mb-3 sm:mb-0 overflow-hidden rounded-[5px] sm:mr-3">
                {item.picture ? (
                  <Image
                    alt={`email of ${item.picture}`}
                    src={String(item.picture)}
                    width={0}
                    sizes="100vw"
                    height={0}
                    className="w-[150px] h-[100px] sm:h-[50] sm:w-[100] sm:mb-0 overflow-hidden rounded-[5px]"
                    style={{
                      width: 'auto',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <span>N/A</span>
                )}
              </div>
              <div className="t w-full sm:w-auto">
                <div className="flex text-lg mb-2 sm:mb-3 items-center">
                  <div className="text-[var(--text-secondary)]">
                    {item.name}
                  </div>{' '}
                  <span className="block mx-1">|</span>
                  <div className="line-clamp-2 overflow-ellipsis">
                    {item.seoTitle}
                  </div>
                </div>
                <div className="flex">
                  <div className="flex mr-5">
                    Cost Price:{' '}
                    <span className="text-[var(--text-secondary)] ml-1">
                      ₦{formatMoney(item.costPrice)}
                    </span>
                  </div>
                  {!item.isBuyable && (
                    <div className="flex">
                      Selling Price:{' '}
                      <span className="text-[var(--text-secondary)] ml-1">
                        ₦{formatMoney(item.price)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute top-[-10px] right-0 flex items-center">
                {!item.isBuyable && (
                  <Package
                    onClick={() => setStockingForm(item)}
                    className="cursor-pointer"
                    size={18}
                  />
                )}
                <Link
                  className="mx-3"
                  href={
                    item.isBuyable
                      ? `/admin/products/edit-buy-product/${item._id}`
                      : `/admin/products/edit-product/${item._id}`
                  }
                >
                  <Edit className="cursor-pointer" size={18} />
                </Link>

                <Trash
                  className="cursor-pointer"
                  onClick={() => startDelete(item._id, index)}
                  size={18}
                />
              </div>
            </div>
            <div
              className="line-clamp-1 overflow-ellipsis leading-[25px]"
              dangerouslySetInnerHTML={{
                __html: item.description,
              }}
            />
          </div>
        </div>
      ))}

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
            <Link
              href={`/admin/products/create-product`}
              className="tableActions"
            >
              <i className="bi bi-plus-circle"></i>
            </Link>
            <Link
              href={`/admin/products/create-buy-product`}
              className="tableActions"
            >
              <i className="bi bi-backpack"></i>
            </Link>
            {/* <div onClick={updateExam} className="tableActions">
              <i className="bi bi-table"></i>
            </div> */}
          </div>
        </div>
      </div>

      {showStocking && <StockingForm />}

      <div className="card_body sharp">
        <LinkedPagination url="/admin/products" count={count} page_size={20} />
      </div>
    </>
  )
}

export default ProductTable

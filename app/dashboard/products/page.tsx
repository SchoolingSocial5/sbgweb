'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatMoney } from '@/lib/helpers'
import _debounce from 'lodash/debounce'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import ProductStore from '@/src/zustand/Product'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { UserStore } from '@/src/zustand/user/User'

const Products: React.FC = () => {
  const {
    getProducts,
    reshuffleResults,
    searchProducts,
    setToCart,
    createTransaction,
    updateCartUnits, clearCart,
    totalAmount,
    searchedProducts,
    cartProducts,
    loading,
    count,
    products,
  } = ProductStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const { userForm, getUser } = UserStore()
  const [showCart, setShowCart] = useState(false)
  const [partPayment, setPartPayment] = useState(0)
  const pathname = usePathname()
  const { page } = useParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const url = '/products'

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    if (user) {
      getUser(`/users/${user.username}`, setMessage)
    }
  }, [user])

  useEffect(() => {
    const params = `?page_size=${page_size}&page=${page ? page : 1
      }&ordering=${sort}&isBuyable=false`
    getProducts(`${url}${params}`, setMessage)
  }, [page])

  const handlesearchProducts = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value.trim().length > 0) {
        searchProducts(
          `${url}/search?author=${value}&content=${value}&title=${value}&subtitle=${value}&page_size=${page_size}`
        )
      } else {
        ProductStore.setState({ searchedProducts: [] })
      }
    },
    1000
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    setReceipt(file)
    if (file) {
      const localUrl = URL.createObjectURL(file)
      setPreview(localUrl)
    }
  }

  const handleSubmit = async (e: string) => {
    if (!user?.username) {
      setMessage('Please select a customer to continue.', false)
      return
    }

    const form = new FormData()
    form.append('username', user.username)
    form.append('fullName', user.fullName)
    form.append('picture', user.picture ? user.picture : '')
    form.append('cartProducts', JSON.stringify(cartProducts))
    form.append('partPayment', JSON.stringify(partPayment))
    form.append('totalAmount', String(totalAmount))
    if (receipt) {
      form.append('receipt', receipt)
    }
    form.append('payment', String(e))
    form.append('isProfit', String(true))
    form.append('from', 'User')
    form.append('status', String(partPayment > 0 ? false : true))

    createTransaction(
      `/transactions?ordering=${sort}&isBuyable=${false}`,
      form,
      setMessage,
      () => {
        setShowCart(false)
        reshuffleResults()
      }
    )
  }

  const close = () => {
    clearCart()
    setShowCart(false)
  }

  return (
    <>
      <div className="card_body sharp mb-5">
        <div className="text-lg flex justify-between items-center text-[var(--text-secondary)]">
          Table of Products{' '}
          <div
            onClick={() => {
              if (cartProducts.length > 0) {
                setShowCart(true)
              }
            }}
            className="flex justify-center ml-auto items-center relative text-white cursor-pointer md:w-15 md:h-15 w-10 h-10"
          >
            <i className="bi bi-cart3 text-[20px] text-[var(--text-secondary)]"></i>
            <div className="w-[20px] h-[20px] text-sm flex justify-center items-center rounded-full top-0 right-0 absolute bg-[var(--customRedColor)]">
              {cartProducts.length > 9 ? '9+' : cartProducts.length || 0}
            </div>
          </div>
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
                  <Link
                    href={`/school/students/student/${item._id}`}
                    className="flex-1"
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-5">
        {products.map((item, index) => (
          <div key={index} className="card_body sharp">
            <div className="">
              <div className="flex flex-wrap sm:flex-nowrap relative items-start mb-3 sm:mb-5">
                <div className="flex items-center mr-3">
                  {(page ? Number(page) - 1 : 1 - 1) * page_size + index + 1}
                </div>
                <div className="relative w-[100px] h-[70px] sm:h-[50] sm:w-[100] mb-3 sm:mb-0 overflow-hidden rounded-[5px] sm:mr-3">
                  {item.picture ? (
                    <Image
                      alt={`email of ${item.picture}`}
                      src={item.picture ? String(item.picture) : '/images/page-header.jpg'}
                      width={0}
                      sizes="100vw"
                      height={0}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
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
                  </div>
                  <div className="flex">
                    <div className="flex">
                      Price:
                      <span className="text-[var(--text-secondary)] ml-1">
                        ₦{formatMoney(item.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid w-full gap-2 grid-cols-3 items-center">
                <div className="flex">
                  Total:
                  <span className="text-[var(--text-secondary)] ml-1">
                    ₦{formatMoney(item.price)}
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    onClick={() => setToCart(item, false)}
                    className="flex justify-center h-[30px] w-[30px] cursor-pointer items-center bg-[var(--secondary)]"
                  >
                    <i className="bi bi-dash text-[var(--text-secondary)]"></i>
                  </div>

                  <input
                    value={item.cartUnits}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (isNaN(value) || value < 0) return
                      updateCartUnits(item._id, value)
                    }}
                    placeholder="Units"
                    className="bg-[var(--secondary)] mx-2 max-w-[80px] p-1 outline-none border border-[var(--border)]"
                    type="number"
                  />
                  <div
                    onClick={() => setToCart(item, true)}
                    className="flex justify-center h-[30px] w-[30px] cursor-pointer items-center bg-[var(--secondary)]"
                  >
                    <i className="bi bi-plus text-[var(--customRedColor)]"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card_body sharp">
        <LinkedPagination
          url="/dashboard/products"
          count={count}
          page_size={20}
        />
      </div>

      {showCart && cartProducts.length > 0 && (
        <div
          onClick={() => setShowCart(false)}
          className="fixed h-full w-full z-40 left-0 top-0 bg-black/50 items-center justify-center flex"
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="card_body sharp w-full max-w-[600px]"
          >
            <div className="overflow-auto max-h-[80vh]">
              {cartProducts.map((item, index) => (
                <div key={index} className="card_body sharp mb-1">
                  <div className="">
                    <div className="flex flex-wrap sm:flex-nowrap relative items-start mb-3">
                      <div className="flex items-center mr-3">{index + 1}</div>
                      <div className="relative w-[70px] h-[50px] mb-3 sm:mb-0 overflow-hidden rounded-[5px] sm:mr-3">
                        {item.picture ? (
                          <Image
                            alt={`email of ${item.picture}`}
                            src={item.picture ? String(item.picture) : '/images/page-header.jpg'}
                            width={0}
                            sizes="100vw"
                            height={0}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <span>N/A</span>
                        )}
                      </div>
                      <div className="flex flex-col items-start w-full sm:w-auto">
                        <div className="text-[var(--text-secondary)] mb-1">
                          {item.name}
                        </div>{' '}
                        <div className="flex text-sm">
                          <div className="flex mr-3">
                            Qty:
                            <span className="text-[var(--text-secondary)] ml-1">
                              {item.cartUnits}
                            </span>
                          </div>
                          <div className="flex">
                            Price:
                            <span className="text-[var(--text-secondary)] ml-1">
                              ₦{formatMoney(item.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex mr-3">
                        Price:
                        <span className="text-[var(--text-secondary)] ml-1">
                          ₦{formatMoney(item.price * item.cartUnits)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div
                          onClick={() => setToCart(item, false)}
                          className="flex justify-center h-[25px] w-[25px] cursor-pointer items-center bg-[var(--secondary)]"
                        >
                          <i className="bi bi-dash text-[var(--text-secondary)]"></i>
                        </div>
                        <div className="text-[var(--customRedColor)] font-bold mx-2">
                          {item.cartUnits}
                        </div>
                        <div
                          onClick={() => setToCart(item, true)}
                          className="flex justify-center h-[25px] w-[25px] cursor-pointer items-center bg-[var(--secondary)]"
                        >
                          <i className="bi bi-plus text-[var(--customRedColor)]"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {preview && (
              <div className="flex justify-center">
                <Image
                  src={preview ? String(preview) : '/images/page-header.jpg'}
                  sizes="100vw"
                  className="h-[150px] rounded-[5px] w-[100px] object-cover mb-4"
                  width={0}
                  height={0}
                  alt="real"
                />
              </div>
            )}

            <div className="text-center text-[var(--customRedColor)] text-sm">
              Upload payment receipts and submit
            </div>

            <div className="flex items-end mb-2 flex-wrap">
              {userForm.isPartPayment && <><div className="text-lg text-[var(--customRedColor)] mr-3">
                Part Payment
              </div>
                <input
                  value={partPayment}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (isNaN(value) || value < 0 || value > totalAmount) return
                    setPartPayment(value)
                  }}
                  placeholder="Part payment"
                  className="bg-[var(--secondary)] max-w-[150px] p-1 outline-none border border-[var(--border)]"
                  type="number"
                /></>}

              <label
                htmlFor="picture"
                className="px-2 cursor-pointer ml-3 bg-[var(--success)] text-white"
              >
                <input
                  className="input-file"
                  type="file"
                  name="picture"
                  id="picture"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Receipt
              </label>
              <div
                onClick={close}
                className="px-3 cursor-pointer py-1 bg-[var(--customColor)] text-[var(--text-secondary)] ml-auto"
              >
                Clear
              </div>
            </div>

            <div className="bg-[var(--secondary)] p-3 flex items-center flex-wrap">
              <div className="mr-auto text-[var(--customRedColor)]">
                ₦{formatMoney(totalAmount)}
              </div>
              <div
                onClick={() => handleSubmit('Transfer')}
                className="px-2 cursor-pointer py-1 bg-[var(--success)] text-[var(--text-secondary)] mr-3"
              >
                Transfer
              </div>
              <div
                onClick={() => handleSubmit('Cash')}
                className="px-3 cursor-pointer py-1 bg-[var(--customRedColor)] text-[var(--text-secondary)] mr-3"
              >
                Cash
              </div>
              <div
                onClick={() => handleSubmit('POS')}
                className="px-3 cursor-pointer py-1 bg-[var(--customColor)] text-[var(--text-secondary)] mr-3"
              >
                POS
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Products

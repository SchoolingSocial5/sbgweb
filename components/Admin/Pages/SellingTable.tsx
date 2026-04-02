'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatMoney } from '@/lib/helpers'
import _debounce from 'lodash/debounce'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import ProductStore from '@/src/zustand/Product'
import { User, UserEmpty, UserStore } from '@/src/zustand/user/User'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import CustomerForm from '../PopUps/CustomerForm'

const SellingTable: React.FC = () => {
  const {
    getProducts,
    setToCart,
    reshuffleResults,
    createTransaction,
    updateCartUnits,
    updateUnitPrice,
    totalAmount,
    cartProducts,
    loading,
    count,
    products,
    clearCart,
  } = ProductStore()
  const [page_size] = useState(20)
  const [sort] = useState('-name')
  const [delivery, setDelivery] = useState('Instant')
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const {
    searchedUsers,
    userForm,
    showUserForm,
    resetForm,
    searchUser,
    setShowUserForm,
  } = UserStore()
  const [showCart, setShowCart] = useState(false)
  const [partPayment, setPartPayment] = useState(0)
  const [adjustedTotal, setTotal] = useState(0)
  const [remark, setRemark] = useState('')
  const pathname = usePathname()
  const { page } = useParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const url = '/products'

  useEffect(() => {
    if (!cartProducts || cartProducts.length === 0) {
      setTotal(0)
      return
    }

    const total = cartProducts.reduce((sum, item) => {
      const priceToUse =
        item.adjustedPrice && item.adjustedPrice > item.costPrice
          ? item.adjustedPrice
          : item.price

      return sum + priceToUse * item.cartUnits
    }, 0)

    setTotal(total)
  }, [cartProducts])

  useEffect(() => {
    // if (cartProducts.length === 0) {
    const params = `?page_size=${page_size}&page=${page ? page : 1
      }&ordering=${sort}&isBuyable=${false}`
    getProducts(`${url}${params}`, setMessage)
    // }
  }, [page, pathname])

  const searchCustomers = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value.trim().length > 0) {
        searchUser(
          `/users/search?fullName=${value}&username=${value}&email=${value}&phone=${value}&page_size=${page_size}`
        )
      } else {
        UserStore.setState({ searchedUsers: [] })
      }
    },
    1000
  )


  const selectUser = (user: User) => {
    UserStore.setState({
      userForm: user,
      searchedUsers: [],
    })
  }

  function invoiceNumber() {
    const date = new Date()
    const yy = String(date.getFullYear()).slice(-2)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')

    return `${yy}${mm}${dd}`
  }

  const handleSubmit = async (e: string) => {
    if (!userForm.fullName || !userForm.phone) {
      setMessage(
        'Please select a customer with at least name and phone number to continue.',
        false
      )
      return
    }

    const form = new FormData()
    form.append('userId', userForm._id)
    form.append('username', userForm.username)
    form.append('phone', userForm.phone)
    form.append('fullName', userForm.fullName)
    form.append('email', userForm.email)
    form.append('address', userForm.address)
    form.append('remark', remark)
    form.append('invoiceNumber', invoiceNumber())
    form.append('staffName', String(user?.fullName))
    form.append('picture', userForm.picture ? userForm.picture : '')
    form.append('cartProducts', JSON.stringify(cartProducts))
    form.append('partPayment', JSON.stringify(partPayment))
    form.append('totalAmount', String(totalAmount))
    form.append('adjustedTotal', String(adjustedTotal))
    form.append('delivery', String(delivery))
    form.append('payment', String(e))
    form.append('isProfit', String(true))
    form.append('status', String(partPayment > 0 ? false : true))

    createTransaction(
      `/transactions?ordering=${sort}&isBuyable=${false}`,
      form,
      setMessage,
      () => {
        setShowCart(false)
        reshuffleResults()
        clearCart()
        selectUser(UserEmpty)
        setRemark('')
        setPartPayment(0)
      }
    )
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
              onChange={searchCustomers}
              className={`transparent-input flex-1 `}
              placeholder="Search customers"
            />
            {loading ? (
              <i className="bi bi-opencollective common-icon loading"></i>
            ) : (
              <i className="bi bi-search common-icon cursor-pointer"></i>
            )}
          </div>

          {searchedUsers.length > 0 && (
            <div
              className={`dropdownList ${searchedUsers.length > 0
                ? 'overflow-auto'
                : 'overflow-hidden h-0'
                }`}
            >
              {searchedUsers.map((item, index) => (
                <div
                  onClick={() => selectUser(item)}
                  key={index}
                  className="input_drop_list"
                >
                  <div className="flex-1 cursor-pointer">{item.fullName}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card_body sharp mb-3 flex items-center flex-wrap">
        {userForm.fullName ? (
          <div
            onClick={resetForm}
            className="px-2 py-1 bg-[var(--secondary)] cursor-pointer text-[var(--text-secondary)] mr-3"
          >
            {userForm.fullName}
          </div>
        ) : (
          <div
            onClick={() => setShowUserForm(!showUserForm)}
            className="px-2 cursor-pointer py-1 bg-[var(--secondary)] text-[var(--text-secondary)] mr-3"
          >
            {'Select Customer'}
          </div>
        )}

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

      {products.map((item, index) => (
        <div key={index} className="card_body sharp mb-1">
          <div className="">
            <div className="flex flex-wrap sm:flex-nowrap relative items-start mb-3 sm:mb-1">
              <div className="flex items-center mr-3">
                {(page ? Number(page) - 1 : 1 - 1) * page_size + index + 1}
              </div>
              <div className="relative w-[150px] h-[100px] sm:h-[50] sm:w-[100] mb-3 sm:mb-0 overflow-hidden rounded-[5px] sm:mr-3">
                {item.picture ? (
                  <Image
                    alt={`email of ${item.picture}`}
                    src={String(item.picture)}
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
                <div className="flex text-lg mb-2 sm:mb-3 items-center">
                  <div className="text-[var(--text-secondary)]">
                    {item.name}
                  </div>{' '}
                  <span className="block mx-1">|</span>
                  <div className="line-clamp-2 overflow-ellipsis">
                    {item.seoTitle}
                  </div>
                </div>
                <div className="flex mb-2">
                  <div className="flex mr-5">
                    Cost Price:{' '}
                    <span className="text-[var(--text-secondary)] ml-1">
                      ₦{formatMoney(item.costPrice)}
                    </span>
                  </div>
                  <div className="flex">
                    Selling Price:{' '}
                    <span className="text-[var(--text-secondary)] ml-1">
                      ₦{formatMoney(item.price)}
                    </span>
                  </div>
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
        </div>
      ))}

      <div className="card_body sharp">
        <LinkedPagination
          url="/admin/activities"
          count={count}
          page_size={20}
        />
      </div>

      {showUserForm && <CustomerForm />}

      {showCart && cartProducts.length > 0 && (
        <div
          onClick={() => setShowCart(false)}
          className="fixed h-full w-full z-50 left-0 top-0 bg-black/50 items-center justify-center flex"
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="card_body sharp w-full max-w-[800px]"
          >
            <div className="overflow-auto max-h-[80vh]">
              {cartProducts.map((item, index) => (
                <div key={index} className="card_body sharp mb-1">
                  <div className="">
                    <div className="flex flex-wrap sm:flex-nowrap relative items-start mb-3">
                      <div className="flex items-center mr-3">{index + 1}</div>
                      <div className="relative w-[100px] h-[70px] mb-3 sm:mb-0 overflow-hidden rounded-[5px] sm:mr-3">
                        {item.picture ? (
                          <Image
                            alt={`email of ${item.picture}`}
                            src={String(item.picture)}
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
                        <div className="flex gap-3 items-center">
                          <div className="flex gap-1">
                            Qty:
                            <span className="text-[var(--text-secondary)]">
                              {item.cartUnits}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            Cost:
                            <span className="text-[var(--text-secondary)]">
                              ₦{formatMoney(item.costPrice)}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            Price:
                            <span className="text-[var(--text-secondary)]">
                              ₦{formatMoney(item.price)}
                            </span>
                          </div>
                          <input
                            value={item.adjustedPrice}
                            onChange={(e) =>
                              updateUnitPrice(Number(e.target.value), index)
                            }
                            placeholder={`${item.price}`}
                            className="bg-[var(--secondary)] ml-2 max-w-[100px] p-1 outline-none border border-[var(--border)]"
                            type="number"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex mr-3">
                        Price:
                        <span className="text-[var(--text-secondary)] ml-1">
                          ₦
                          {formatMoney(
                            item.adjustedPrice
                              ? item.adjustedPrice * item.cartUnits
                              : item.price * item.cartUnits
                          )}
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

            <div className="flex gap-5 w-full items-center">
              <div className="flex items-end mb-2">
                <div className="text-lg text-[var(--customRedColor)] mr-3">
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
                />
              </div>
              <div className="flex items-end mb-2">
                <div className="text-lg text-[var(--customRedColor)] mr-3">
                  Delivery
                </div>
                <div
                  onClick={() =>
                    setDelivery(delivery === 'Instant' ? 'Ordered' : 'Instant')
                  }
                  className={`${delivery === 'Instant'
                    ? 'bg-[var(--success)]'
                    : 'bg-[var(--customRedColor)]'
                    } px-2 cursor-pointer py-1 text-white`}
                >
                  {delivery}
                </div>
              </div>
            </div>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              name="remark"
              id=""
              placeholder="Transaction remark"
              className="w-full p-1 bg-[var(--secondary)] outline-none border-none mb-2"
            ></textarea>

            <div className="bg-[var(--secondary)] p-3 flex items-center flex-wrap">
              <div className="mr-3 text-[var(--customRedColor)]">
                ₦{formatMoney(totalAmount)}
              </div>
              <div className="mr-auto text-[var(--success)]">
                ₦{formatMoney(adjustedTotal)}
              </div>
              <div
                onClick={() => !loading && handleSubmit('Transfer')}
                className={`px-2 cursor-pointer py-1 bg-[var(--success)] text-white mr-3 ${loading ? 'opacity-50 !cursor-not-allowed pointer-events-none' : ''}`}
              >
                {loading ? <i className="bi bi-opencollective loading mr-1"></i> : null} Transfer
              </div>
              <div
                onClick={() => !loading && handleSubmit('Cash')}
                className={`px-3 cursor-pointer py-1 bg-[var(--customRedColor)] text-white mr-3 ${loading ? 'opacity-50 !cursor-not-allowed pointer-events-none' : ''}`}
              >
                {loading ? <i className="bi bi-opencollective loading mr-1"></i> : null} Cash
              </div>
              <div
                onClick={() => !loading && handleSubmit('POS')}
                className={`px-3 cursor-pointer py-1 bg-[var(--customColor)] text-white mr-3 ${loading ? 'opacity-50 !cursor-not-allowed pointer-events-none' : ''}`}
              >
                {loading ? <i className="bi bi-opencollective loading mr-1"></i> : null} POS
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SellingTable

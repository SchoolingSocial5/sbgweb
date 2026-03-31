'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProductStore from '@/src/zustand/Product'
import { formatMoney } from '@/lib/helpers'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { PageHeader } from '@/components/Public/PageBanner'
import { MessageStore } from '@/src/zustand/notification/Message'
import CompanyStore from '@/src/zustand/app/Company'
import Spinner from '@/components/LoadingAnimations/Spinner'
import { useRouter } from 'next/navigation'

function CheckOut() {
  const { cartProducts, loading, totalAmount, clearCart, setToCart, createTransaction } =
    ProductStore()
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { companyForm } = CompanyStore()
  const [showCart, setShowCart] = useState(false)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    setReceipt(file)
    if (file) {
      const localUrl = URL.createObjectURL(file)
      setPreview(localUrl)
    }
  }

  const handleSubmit = async (e: string) => {
    if (!user) {
      setMessage('Please login to your account to continue.', false)
      return
    }

    const form = new FormData()
    form.append('username', user.username)
    form.append('fullName', user.fullName)
    form.append('picture', user.picture)
    form.append('cartProducts', JSON.stringify(cartProducts))
    form.append('partPayment', JSON.stringify(0))
    form.append('from', 'User')
    form.append('totalAmount', String(totalAmount))
    if (receipt) {
      form.append('receipt', receipt)
    }
    form.append('payment', String(e))
    form.append('isProfit', String(true))
    form.append('status', String(false))

    createTransaction(
      `/transactions?ordering=-createdAt&isBuyable=false`,
      form,
      setMessage,
      () => {
        router.push('/')
        setShowCart(false)
      }
    )
  }

  const removeItems = () => {
    clearCart()
    router.push("/products")
  }

  return (
    <div>
      {/*//// CheckOut Section 1 ////*/}
      <PageHeader page="Check Out" title="Check Out Cart Products" />

      <div className="flex py-[100px] justify-center bg-[var(--backgroundColor)]">
        <div className="customContainer">
          <div className="flex flex-col items-center ">
            <div className="mb-4 max-w-[800px]">
              {cartProducts.map((item, i) => (
                <div
                  key={i}
                  className={`${i % 2 === 0 ? 'bg-[var(--secondaryCustomColor)]' : ''
                    } flex px-3 sm:px-7 py-3 sm:py-8 flex-col shadow-sm mb-6`}
                >
                  <div className="flex items-center flex-wrap ">
                    <div className="flex md:flex-col items-center mb-3 md:mb-0">
                      <div className="mb-3">
                        <Image
                          src={String(item.picture)}
                          sizes="100vw"
                          className="md:h-[70px] object-contain h-[85px] md:w-[70px] w-[85px] md:mr-0 mr-4"
                          width={0}
                          height={0}
                          alt="real"
                        />
                      </div>
                      <div className="text-[20px] text-[var(--primaryTextColor)]">
                        {item.name}
                      </div>
                    </div>
                    <div className="grid font-semibold grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                      <div className="flex sm:text-[20px] mr-4 pr-[16px]">
                        <span className="mr-2 ">Price</span>
                        <span>₦{formatMoney(item.price)}</span>
                      </div>
                      <div className="flex sm:text-[20px] mr-4">
                        <span className="mr-2">Total</span>
                        <span className="mr-2">
                          ₦{formatMoney(item.price * item.cartUnits)}
                        </span>
                      </div>

                      <div className="flex w-full text-[20px]">
                        <div
                          onClick={() => setToCart(item, false)}
                          className="flex justify-center h-[30px] w-[35px] cursor-pointer items-center border border-gray-200 rounded-[5px]"
                        >
                          <i className="bi bi-dash text-[var(--primaryTextColor)]"></i>
                        </div>
                        <div className="text-[var(--customRedColor)] px-3">
                          <span className="mr-2">Qty</span>
                          <span>{item.cartUnits}</span>
                        </div>
                        <div
                          onClick={() => setToCart(item, true)}
                          className="flex justify-center h-[30px] w-[35px] cursor-pointer items-center border border-gray-200 rounded-[5px]"
                        >
                          <i className="bi bi-plus text-[var(--primaryTextColor)]"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex px-7 py-8 flex-col shadow-sm mb-6">
                <div className="flex">
                  <div className="text-[20px] text-[var(--primaryTextColor)] mr-4">
                    Total
                  </div>
                  <div className="text-[20px] text-[var(--primaryTextColor)]">
                    ₦{formatMoney(totalAmount)}
                  </div>
                </div>
              </div>
            </div>
            {cartProducts.length > 0 && (
              <div className="flex items-center flex-wrap gap-3">
                {loading ? (
                  <Spinner size={30} />
                ) : (
                  <>
                    {user ? <>
                      <div
                        className="text-[20px] cursor-pointer text-white bg-[var(--customColor)] rounded py-[10px] px-[30px]"
                        onClick={() => handleSubmit('Cash')}
                      >
                        Pay Cash
                      </div>
                      <div
                        className="text-[20px] cursor-pointer text-white bg-[var(--success)] rounded py-[10px] px-[30px]"
                        onClick={() => setShowCart(true)}
                      >
                        Transfer
                      </div>
                      <div
                        className="text-[20px] cursor-pointer text-white bg-[var(--customColor)] rounded py-[10px] px-[30px]"
                        onClick={removeItems}
                      >
                        Clear Cart
                      </div>
                    </> : <Link
                      className="text-[20px] text-white bg-[var(--customColor)] rounded py-[10px] px-[30px]"
                      href={'/sign-in'}
                    >
                      Login To Purchase
                    </Link>}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCart && cartProducts.length > 0 && (
        <div
          onClick={() => setShowCart(false)}
          className="fixed h-full w-full z-30 left-0 top-0 bg-black/50 items-center justify-center flex"
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="bg-white p-4 sharp w-full max-w-[600px] max-h-[100vh] overflow-auto"
          >
            <div className="flex justify-center mb-4">
              <Image
                src="/Icon.png"
                sizes="100vw"
                className="h-[60px] w-auto object-contain"
                width={0}
                height={0}
                alt="real"
              />
            </div>
            <div className="overflow-auto flex flex-col items-start max-h-[80vh]">
              <div className="flex items-center mb-3">
                <span className="w-[150px]">{`Customer's Name:`}</span>{' '}
                <span>{user?.fullName}</span>
              </div>
              <div className="mb-3 font-bold">Payment Details</div>
              <div className="flex items-center mb-2">
                <span className="w-[150px]">Bank Name:</span>{' '}
                <span>{companyForm.bankName}</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="w-[150px]">Account Name:</span>{' '}
                <span>{companyForm.bankAccountName}</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="w-[150px]">Account Number:</span>{' '}
                <span>{companyForm.bankAccountNumber}</span>
              </div>
            </div>

            {preview && (
              <div className="flex justify-center">
                <Image
                  src={String(preview)}
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
            {loading ? (
              <div className="px-2 flex justify-center cursor-pointer py-[8px] bg-[var(--customRedColor)] text-white">
                <Spinner size={30} />
              </div>
            ) : (
              <div className="bg-[var(--secondaryCustomColor)] p-3 flex items-center flex-col">
                <div className="text-[var(--customRedColor)] text-center font-bold mb-2 text-lg">
                  ₦{formatMoney(totalAmount)}
                </div>
                <div className="flex justify-center gap-3 items-center">
                  <label
                    htmlFor="picture"
                    className="px-2 cursor-pointer py-1 bg-[var(--success)] text-white"
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
                    onClick={() => handleSubmit('Transfer')}
                    className="px-2 ml-3 cursor-pointer py-[8px] bg-[var(--success)] text-white"
                  >
                    Submit Payment
                  </div>
                  <div
                    onClick={() => setShowCart(false)}
                    className="px-2 ml-3 cursor-pointer py-[8px] bg-[var(--customRedColor)] text-white"
                  >
                    Cancel Payment
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckOut

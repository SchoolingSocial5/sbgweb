'use client'
import React from 'react'
import { Transaction } from '@/src/zustand/Transaction'
import CompanyStore from '@/src/zustand/app/Company'
import { formatMoney, formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'

interface PrintSlipProps {
  transaction: Transaction
  onClose: () => void
}

const PrintSlip: React.FC<PrintSlipProps> = ({ transaction, onClose }) => {
  const { companyForm } = CompanyStore()

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 no-print overflow-auto">
        <div className="bg-white text-black p-6 w-full max-w-[400px] shadow-2xl relative rounded-sm">
          <button 
            onClick={onClose}
            className="absolute -top-10 right-0 text-white hover:text-gray-300 flex items-center"
          >
            <i className="bi bi-x-lg mr-1"></i> Close
          </button>
          
          <div id="printable-slip" className="receipt-content">
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * {
                  visibility: hidden;
                }
                #printable-slip, #printable-slip * {
                  visibility: visible;
                }
                #printable-slip {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 80mm; /* Standard thermal paper width */
                  padding: 10px;
                  margin: 0;
                  color: black !important;
                  background: white !important;
                }
                .no-print {
                   display: none !important;
                }
              }
              .receipt-content {
                font-family: 'Courier New', Courier, monospace;
                font-size: 14px;
                line-height: 1.4;
                color: #000;
              }
              .receipt-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 1px dashed #ccc;
                padding-bottom: 10px;
              }
              .receipt-title {
                font-weight: bold;
                font-size: 18px;
                text-transform: uppercase;
              }
              .receipt-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
              }
              .receipt-divider {
                border-top: 1px dashed #ccc;
                margin: 10px 0;
              }
              .receipt-items {
                margin: 10px 0;
              }
              .item-name {
                font-weight: bold;
              }
              .item-details {
                font-size: 12px;
                display: flex;
                justify-content: space-between;
                padding-left: 10px;
              }
              .receipt-total {
                margin-top: 15px;
                border-top: 2px solid #000;
                padding-top: 10px;
                font-weight: bold;
                font-size: 16px;
              }
              .receipt-footer {
                text-align: center;
                margin-top: 20px;
                font-size: 12px;
                border-top: 1px dashed #ccc;
                padding-top: 10px;
              }
            `}} />
            
            <div className="receipt-header">
              <div className="receipt-title">{companyForm.name || 'SBG STORE'}</div>
              <div>{companyForm.headquaters}</div>
              <div>Tel: {companyForm.phone}</div>
              <div>Email: {companyForm.email}</div>
            </div>

            <div className="receipt-row">
              <span>Invoice #:</span>
              <span>{transaction.invoiceNumber}</span>
            </div>
            <div className="receipt-row">
              <span>Date:</span>
              <span>{formatDateToDDMMYY(transaction.createdAt)} {formatTimeTo12Hour(transaction.createdAt)}</span>
            </div>
            <div className="receipt-row">
              <span>Staff:</span>
              <span>{transaction.staffName}</span>
            </div>
            <div className="receipt-row">
              <span>Customer:</span>
              <span>{transaction.fullName}</span>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-items">
              {transaction.cartProducts.map((item, index) => (
                <div key={index} className="mb-2">
                  <div className="item-name">{item.name}</div>
                  <div className="item-details">
                    <span>{item.cartUnits} {item.purchaseUnit} x ₦{formatMoney(item.adjustedPrice || item.price)}</span>
                    <span>₦{formatMoney((item.adjustedPrice || item.price) * item.cartUnits)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="receipt-total">
              <div className="receipt-row">
                <span>TOTAL:</span>
                <span>₦{formatMoney(transaction.adjustedTotal || transaction.totalAmount)}</span>
              </div>
            </div>

            <div className="receipt-divider"></div>
            
            <div className="receipt-row">
              <span>Payment Type:</span>
              <span>{transaction.payment}</span>
            </div>
            <div className="receipt-row">
              <span>Amount Paid:</span>
              <span>₦{formatMoney(transaction.partPayment || (transaction.status ? (transaction.adjustedTotal || transaction.totalAmount) : 0))}</span>
            </div>
            <div className="receipt-row">
              <span>Balance:</span>
              <span>₦{formatMoney(Math.max(0, (transaction.adjustedTotal || transaction.totalAmount) - (transaction.partPayment || (transaction.status ? (transaction.adjustedTotal || transaction.totalAmount) : 0))))}</span>
            </div>

            <div className="receipt-footer">
              <div>Thank you for your business!</div>
              <div>Please come again.</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3 no-print">
            <button 
              onClick={handlePrint}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center"
            >
              <i className="bi bi-printer mr-2"></i> Print Slip
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default PrintSlip

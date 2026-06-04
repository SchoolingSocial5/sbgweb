'use client'
import React from 'react'
import { Transaction } from '@/src/zustand/Transaction'
import CompanyStore from '@/src/zustand/app/Company'
import { formatMoney, formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useState } from 'react'

interface PrintSlipProps {
  transaction: Transaction
  onClose: () => void
}

const PrintSlip: React.FC<PrintSlipProps> = ({ transaction, onClose }) => {
  const { companyForm } = CompanyStore()
  const [sharing, setSharing] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    const element = document.getElementById('printable-slip');
    if (!element) return;

    try {
      setSharing(true);
      
      const canvas = await html2canvas(element, {
        scale: 3, 
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
      if (!blob) throw new Error('Failed to generate image');

      const fileName = `Receipt_${transaction.invoiceNumber}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Transaction Receipt',
          text: `Receipt from ${companyForm.name || 'Paragon Farms'} - Invoice #${transaction.invoiceNumber}`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
    } finally {
      setSharing(false);
    }
  };

  const handlePrintPDF = async () => {
    const element = document.getElementById('printable-slip');
    if (!element) return;

    try {
      setDownloading(true);
      
      const canvas = await html2canvas(element, {
        scale: 3, 
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dynamic height based on 80mm width ratio
      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Tell the PDF to automatically open the print dialog when generated
      pdf.autoPrint();
      
      // Output as a blob and open in a new tab
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const totalAmount = transaction.adjustedTotal || transaction.totalAmount;
  const paidAmount = transaction.partPayment || (transaction.status ? totalAmount : 0);
  const balance = Math.max(0, totalAmount - paidAmount);

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 overflow-auto print:p-0 print:bg-transparent print:static">
        <div className="bg-white text-black p-4 w-full max-w-[380px] shadow-2xl relative rounded-sm print:static print:max-w-none print:w-full print:shadow-none print:p-0 print:m-0">
          <button 
            onClick={onClose}
            className="absolute -top-10 right-0 text-white hover:text-gray-300 flex items-center text-sm font-bold no-print"
          >
            <i className="bi bi-x-lg mr-2"></i> CLOSE
          </button>
          
          {/* Printable Area */}
          <div id="printable-slip" className="receipt-content">
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                @page {
                  margin: 0;
                  size: 80mm auto;
                }
                html, body {
                  height: auto !important;
                  min-height: 100vh !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  overflow: visible !important;
                }
                body * {
                  visibility: hidden !important;
                }
                #printable-slip, #printable-slip * {
                  visibility: visible !important;
                }
                #printable-slip {
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 80mm !important;
                  margin: 0 !important;
                  padding: 10px !important;
                  display: block !important;
                  transform: none !important;
                }
                .no-print {
                  display: none !important;
                }
              }
              .receipt-content {
                font-family: 'Courier New', Courier, monospace;
                font-size: 15px;
                line-height: 1.6;
                color: #000 !important;
                background: #fff;
                width: 100%;
                font-weight: bold;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                -webkit-text-stroke: 0.4px black;
              }
              .receipt-header {
                text-align: center;
                margin-bottom: 16px;
              }
              .business-name {
                font-weight: 900;
                font-size: 20px;
                text-transform: uppercase;
                margin-bottom: 4px;
                letter-spacing: 0.5px;
              }
              .dashed-divider {
                border-top: 1.5px dashed #000;
                margin: 15px 0;
              }
              .receipt-info-stacked {
                text-align: center;
                margin-bottom: 15px;
              }
              .info-item {
                margin-bottom: 12px;
              }
              .info-label-stacked {
                font-weight: 900;
                margin-bottom: 2px;
                text-transform: uppercase;
                font-size: 13px;
              }
              .info-value-stacked {
                font-weight: bold;
              }
              .receipt-info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
              }
              .info-label {
                min-width: 80px;
                font-weight: 900;
              }
              .info-value {
                text-align: right;
                font-weight: bold;
              }
              .item-row {
                margin-bottom: 12px;
              }
              .item-main {
                font-weight: 900;
                font-size: 16px;
                margin-bottom: 4px;
              }
              .item-main-line {
                display: flex;
                justify-content: space-between;
                font-weight: 900;
              }
              .item-sub-line {
                display: flex;
                justify-content: space-between;
                font-size: 14px;
                padding-left: 15px;
                font-weight: bold;
              }
              .total-row {
                margin-top: 10px;
                border-top: 2.5px solid #000;
                padding-top: 12px;
                font-weight: 900;
                font-size: 18px;
                display: flex;
                justify-content: space-between;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 13px;
                padding-bottom: 10px;
                font-weight: bold;
                line-height: 1.8;
              }
            `}} />
            
            {/* Header */}
            <div className="receipt-header">
              <div className="business-name">{companyForm.name || 'PARAGON FARMS'}</div>
              <div>{companyForm.headquaters || 'River State'}</div>
              <div>Tel: {companyForm.phone || '08098576453'}</div>
              <div style={{fontSize: '11px'}}>Email: {companyForm.email || 'support@paragonfarmsltd.com'}</div>
            </div>

            <div className="dashed-divider"></div>

            {/* Info Section */}
            <div className="receipt-info-stacked">
              <div className="info-item">
                <div className="info-label-stacked">Invoice #:</div>
                <div className="info-value-stacked">{transaction.invoiceNumber}</div>
              </div>
              <div className="info-item">
                <div className="info-label-stacked">Date:</div>
                <div className="info-value-stacked">{formatDateToDDMMYY(transaction.createdAt)} {formatTimeTo12Hour(transaction.createdAt)}</div>
              </div>
              <div className="info-item">
                <div className="info-label-stacked">Staff:</div>
                <div className="info-value-stacked">{transaction.staffName}</div>
              </div>
              <div className="info-item">
                <div className="info-label-stacked">Customer:</div>
                <div className="info-value-stacked">{transaction.fullName}</div>
              </div>
            </div>

            <div className="dashed-divider"></div>

            {/* Iterating Items */}
            <div className="receipt-items">
              {transaction.cartProducts.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-main">{item.name}</div>
                  <div className="item-sub-line">
                    <span>{item.cartUnits} {item.purchaseUnit} x ₦{formatMoney(item.adjustedPrice || item.price)}</span>
                    <span>₦{formatMoney((item.adjustedPrice || item.price) * item.cartUnits)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="total-row">
              <span>TOTAL:</span>
              <span>₦{formatMoney(totalAmount)}</span>
            </div>

            <div className="dashed-divider"></div>

            {/* Payment Section */}
            <div className="receipt-info-row">
              <span className="info-label">Payment Type:</span>
              <span className="info-value">{transaction.payment}</span>
            </div>
            <div className="receipt-info-row">
              <span className="info-label">Amount Paid:</span>
              <span className="info-value">₦{formatMoney(paidAmount)}</span>
            </div>
            <div className="receipt-info-row">
              <span className="info-label">Balance:</span>
              <span className="info-value">₦{formatMoney(balance)}</span>
            </div>

            <div className="dashed-divider"></div>

            {/* Footer */}
            <div className="footer">
              <div>Thank you for your business!</div>
              <div>Please come again.</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-2 no-print">
            <button 
              onClick={handlePrint}
              className="w-full bg-[#000] text-white py-3 rounded-md flex items-center justify-center font-bold text-sm tracking-widest hover:opacity-90 active:scale-[0.98] transition-transform mb-1"
            >
              <i className="bi bi-printer mr-2"></i> PRINT DIRECTLY
            </button>
            <button 
              onClick={handlePrintPDF}
              disabled={downloading}
              className="w-full bg-red-600 text-white py-3 rounded-md flex items-center justify-center font-bold text-sm tracking-widest hover:bg-red-700 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin mr-2"></i> PREPARING PDF...
                </>
              ) : (
                <>
                  <i className="bi bi-file-earmark-pdf mr-2"></i> PRINT RECEIPT (PDF)
                </>
              )}
            </button>
            <button 
              onClick={handleShare}
              disabled={sharing}
              className="w-full bg-[#f0f0f0] text-black py-3 rounded-md flex items-center justify-center font-bold text-sm tracking-widest hover:bg-[#e0e0e0] active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {sharing ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin mr-2"></i> PREPARING...
                </>
              ) : (
                <>
                  <i className="bi bi-share mr-2"></i> SHARE RECEIPT
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default PrintSlip

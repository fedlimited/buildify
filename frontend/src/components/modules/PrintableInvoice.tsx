import React from 'react';
import { X } from 'lucide-react';

interface InvoiceProps {
  payment: {
    id: number;
    company_name: string;
    company_id?: number;
    subdomain?: string;
    amount_kes: number;
    amount_usd: number;
    payment_method: string;
    mpesa_transaction_id?: string;
    stripe_payment_intent_id?: string;
    status: string;
    paid_at: string;
    created_at: string;
    plan_name?: string;
  };
  onClose: () => void;
}

export function PrintableInvoice({ payment, onClose }: InvoiceProps) {
  const vatRate = 0.16;
  const amountKES = payment.amount_kes || 0;
  const amountUSD = payment.amount_usd || 0;
  const vatAmount = amountKES * vatRate;
  const subtotal = amountKES - vatAmount;
  const invoiceNumber = `INV-BOCHI-${payment.id.toString().padStart(6, '0')}`;
  const invoiceDate = new Date(payment.paid_at || payment.created_at).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            padding: 10mm;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center no-print" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b no-print">
            <h2 className="text-lg font-semibold">Invoice Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                🖨️ Print Invoice
              </button>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Content */}
          <div id="printable-invoice" className="p-8 bg-white text-black">
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-amber-600">BOCHI</h1>
                  <p className="text-gray-600 text-sm mt-1">Construction Suite</p>
                  <p className="text-gray-500 text-xs mt-4">P.O. Box 12345, Nairobi, Kenya</p>
                  <p className="text-gray-500 text-xs">Email: info@bochi.ke | Web: bochi.ke</p>
                  <p className="text-gray-500 text-xs">KRA PIN: P000000000X</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">INVOICE</h2>
                  <p className="text-gray-600 text-sm mt-1">#{invoiceNumber}</p>
                  <div className="mt-4 text-sm">
                    <p className="text-gray-600"><strong>Date:</strong> {invoiceDate}</p>
                    <p className="text-gray-600"><strong>Status:</strong> <span className="text-green-600 font-semibold">PAID</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To:</h3>
              <p className="text-lg font-semibold text-gray-800">{payment.company_name}</p>
              {payment.subdomain && (
                <p className="text-gray-600 text-sm">{payment.subdomain}.bochi.ke</p>
              )}
            </div>

            {/* Payment Details */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Details:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600">Payment Method: <span className="font-medium text-gray-800 capitalize">{payment.payment_method || 'N/A'}</span></p>
                <p className="text-gray-600">Plan: <span className="font-medium text-gray-800">{payment.plan_name || 'Subscription'}</span></p>
                {payment.mpesa_transaction_id && (
                  <p className="text-gray-600 col-span-2">M-Pesa Ref: <span className="font-mono text-xs">{payment.mpesa_transaction_id}</span></p>
                )}
                {payment.stripe_payment_intent_id && (
                  <p className="text-gray-600 col-span-2">Stripe Ref: <span className="font-mono text-xs">{payment.stripe_payment_intent_id}</span></p>
                )}
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-3 text-sm font-semibold text-gray-600 uppercase">Description</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-600 uppercase">Amount (KES)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-800">Subscription Payment - {payment.company_name}</td>
                  <td className="py-3 text-right font-mono text-gray-800">{subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600">VAT (16%)</td>
                  <td className="py-3 text-right font-mono text-gray-600">{vatAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-800">
                  <td className="py-3 text-lg font-bold text-gray-800">Total (KES)</td>
                  <td className="py-3 text-right text-lg font-bold font-mono text-gray-800">
                    KES {amountKES.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {payment.amount_usd > 0 && (
                  <tr>
                    <td className="py-1 text-sm text-gray-500">Equivalent (USD)</td>
                    <td className="py-1 text-right text-sm text-gray-500 font-mono">${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                )}
              </tfoot>
            </table>

            {/* VAT Breakdown */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">VAT Breakdown</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600">Subtotal (excl. VAT):</p>
                <p className="text-right font-mono text-gray-800">KES {subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
                <p className="text-gray-600">VAT @ 16%:</p>
                <p className="text-right font-mono text-gray-800">KES {vatAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
                <p className="text-gray-800 font-semibold border-t border-gray-300 pt-1">Total (incl. VAT):</p>
                <p className="text-right font-bold font-mono text-gray-800 border-t border-gray-300 pt-1">KES {amountKES.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
              <p>This is a computer-generated invoice from BOCHI Construction Suite.</p>
              <p className="mt-1">For any queries, contact: info@bochi.ke | bochi.ke</p>
              <p className="mt-3 text-gray-400">Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
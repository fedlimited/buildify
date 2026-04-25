import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';

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
  const invoiceRef = useRef<HTMLDivElement>(null);
  const vatRate = 0.16;
  const amountKES = payment.amount_kes || 0;
  const amountUSD = payment.amount_usd || 0;
  const isPaid = payment.status === 'completed' || payment.status === 'succeeded';
  const vatAmount = amountKES * vatRate;
  const subtotal = amountKES - vatAmount;
  const invoiceNumber = `INV-BOCHI-${payment.id.toString().padStart(6, '0')}`;
  const invoiceDate = new Date(payment.paid_at || payment.created_at).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice-content');
    const originalContents = document.body.innerHTML;
    
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Invoice ${invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000; }
              .invoice-container { max-width: 800px; margin: 0 auto; }
              .header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; }
              .company-info h1 { color: #d97706; margin: 0; font-size: 24px; }
              .company-info p { margin: 2px 0; font-size: 12px; color: #555; }
              .invoice-title { text-align: right; }
              .invoice-title h2 { font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
              .section { margin-bottom: 15px; }
              .section h3 { font-size: 12px; color: #666; text-transform: uppercase; margin: 0 0 5px 0; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
              th { text-align: left; padding: 8px; border-bottom: 2px solid #000; font-size: 11px; color: #666; text-transform: uppercase; }
              td { padding: 8px; border-bottom: 1px solid #ddd; }
              .text-right { text-align: right; }
              .font-mono { font-family: 'Courier New', monospace; }
              .font-bold { font-weight: bold; }
              .vat-box { background: #f5f5f5; padding: 12px; border-radius: 4px; margin-bottom: 15px; }
              .footer { border-top: 1px solid #ddd; padding-top: 10px; text-align: center; font-size: 11px; color: #888; }
              .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
              .status-paid { background: #d4edda; color: #155724; }
              .status-unpaid { background: #f8d7da; color: #721c24; }
              @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      }
    }
  };

  const handleDownloadPDF = async () => {
    const printContent = document.getElementById('printable-invoice-content');
    if (!printContent) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; }
          .company-info h1 { color: #d97706; margin: 0; font-size: 24px; }
          .company-info p { margin: 2px 0; font-size: 12px; color: #555; }
          .invoice-title { text-align: right; }
          .invoice-title h2 { font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
          .section { margin-bottom: 15px; }
          .section h3 { font-size: 12px; color: #666; text-transform: uppercase; margin: 0 0 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th { text-align: left; padding: 8px; border-bottom: 2px solid #000; font-size: 11px; color: #666; text-transform: uppercase; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          .text-right { text-align: right; }
          .font-mono { font-family: 'Courier New', monospace; }
          .font-bold { font-weight: bold; }
          .vat-box { background: #f5f5f5; padding: 12px; border-radius: 4px; margin-bottom: 15px; }
          .footer { border-top: 1px solid #ddd; padding-top: 10px; text-align: center; font-size: 11px; color: #888; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status-paid { background: #d4edda; color: #155724; }
          .status-unpaid { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `;

    // Create a Blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice-content, #printable-invoice-content * { visibility: visible; }
          #printable-invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center no-print" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b no-print sticky top-0 bg-white dark:bg-gray-900 z-10">
            <h2 className="text-lg font-semibold">Invoice Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Content */}
          <div id="printable-invoice-content" className="p-8 bg-white text-black">
            <div className="invoice-container" ref={invoiceRef}>
              {/* Header */}
              <div className="header" style={{ borderBottom: '2px solid #000', paddingBottom: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <div className="company-info">
                  <h1 style={{ color: '#d97706', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>BOCHI</h1>
                  <p style={{ margin: '2px 0', fontSize: '13px', fontWeight: 'bold' }}>Construction Suite</p>
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#555' }}>Finite Element Designs Limited</p>
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#555' }}>P.O. Box 197-00618 Ruaraka, Nairobi, Kenya</p>
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#555' }}>Email: info@bochi.ke | Web: bochi.ke</p>
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#555' }}>KRA PIN: P051927399I</p>
                </div>
                <div className="invoice-title" style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '28px', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>INVOICE</h2>
                  <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>#{invoiceNumber}</p>
                  <div style={{ marginTop: '10px', fontSize: '13px' }}>
                    <p style={{ color: '#555', margin: '2px 0' }}><strong>Date:</strong> {invoiceDate}</p>
                    <p style={{ color: '#555', margin: '2px 0' }}>
                      <strong>Status:</strong>{' '}
                      <span className={`status-badge ${isPaid ? 'status-paid' : 'status-unpaid'}`}
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: isPaid ? '#d4edda' : '#f8d7da',
                          color: isPaid ? '#155724' : '#721c24'
                        }}
                      >
                        {isPaid ? 'PAID' : payment.status?.toUpperCase() || 'UNPAID'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="section" style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Bill To:</h3>
                <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#000' }}>{payment.company_name}</p>
                {payment.subdomain && (
                  <p style={{ color: '#555', fontSize: '13px', margin: '2px 0' }}>{payment.subdomain}.bochi.ke</p>
                )}
              </div>

              {/* Payment Details */}
              <div className="section" style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Payment Details:</h3>
                <div style={{ fontSize: '13px' }}>
                  <p style={{ color: '#555', margin: '2px 0' }}>Payment Method: <span style={{ fontWeight: 'bold', color: '#000', textTransform: 'capitalize' }}>{payment.payment_method || 'N/A'}</span></p>
                  <p style={{ color: '#555', margin: '2px 0' }}>Plan: <span style={{ fontWeight: 'bold', color: '#000' }}>{payment.plan_name || 'Subscription'}</span></p>
                  {payment.mpesa_transaction_id && (
                    <p style={{ color: '#555', margin: '2px 0' }}>M-Pesa Ref: <span style={{ fontFamily: 'Courier New, monospace', fontSize: '12px', color: '#000' }}>{payment.mpesa_transaction_id}</span></p>
                  )}
                  {payment.stripe_payment_intent_id && (
                    <p style={{ color: '#555', margin: '2px 0' }}>Stripe Ref: <span style={{ fontFamily: 'Courier New, monospace', fontSize: '12px', color: '#000' }}>{payment.stripe_payment_intent_id}</span></p>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #000', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '8px', borderBottom: '2px solid #000', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Amount (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd', color: '#000' }}>Subscription Payment - {payment.company_name}</td>
                    <td className="text-right font-mono" style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'right', fontFamily: 'Courier New, monospace', color: '#000' }}>{subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd', color: '#555' }}>VAT (16%)</td>
                    <td className="text-right font-mono" style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'right', fontFamily: 'Courier New, monospace', color: '#555' }}>{vatAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ padding: '8px', borderTop: '2px solid #000', fontSize: '16px', fontWeight: 'bold', color: '#000' }}>Total (KES)</td>
                    <td className="text-right font-mono font-bold" style={{ padding: '8px', borderTop: '2px solid #000', textAlign: 'right', fontFamily: 'Courier New, monospace', fontSize: '16px', fontWeight: 'bold', color: '#000' }}>
                      KES {amountKES.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {payment.amount_usd > 0 && (
                    <tr>
                      <td style={{ padding: '4px 8px', fontSize: '12px', color: '#888' }}>Equivalent (USD)</td>
                      <td className="text-right" style={{ padding: '4px 8px', textAlign: 'right', fontSize: '12px', color: '#888', fontFamily: 'Courier New, monospace' }}>${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                </tfoot>
              </table>

              {/* VAT Breakdown */}
              <div className="vat-box" style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' }}>VAT Breakdown</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '13px' }}>
                  <p style={{ color: '#555', margin: '2px 0' }}>Subtotal (excl. VAT):</p>
                  <p className="text-right font-mono" style={{ textAlign: 'right', fontFamily: 'Courier New, monospace', color: '#000', margin: '2px 0' }}>KES {subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
                  <p style={{ color: '#555', margin: '2px 0' }}>VAT @ 16%:</p>
                  <p className="text-right font-mono" style={{ textAlign: 'right', fontFamily: 'Courier New, monospace', color: '#000', margin: '2px 0' }}>KES {vatAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
                  <p style={{ fontWeight: 'bold', color: '#000', borderTop: '1px solid #ccc', paddingTop: '4px', margin: '2px 0' }}>Total (incl. VAT):</p>
                  <p className="text-right font-mono font-bold" style={{ textAlign: 'right', fontFamily: 'Courier New, monospace', fontWeight: 'bold', color: '#000', borderTop: '1px solid #ccc', paddingTop: '4px', margin: '2px 0' }}>KES {amountKES.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="footer" style={{ borderTop: '1px solid #ddd', paddingTop: '10px', textAlign: 'center', fontSize: '11px', color: '#888' }}>
                <p style={{ margin: '2px 0' }}>This is a computer-generated invoice from BOCHI Construction Suite.</p>
                <p style={{ margin: '2px 0' }}>For any queries, contact: info@bochi.ke | bochi.ke</p>
                <p style={{ margin: '8px 0 2px 0', color: '#aaa' }}>Thank you for your business!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
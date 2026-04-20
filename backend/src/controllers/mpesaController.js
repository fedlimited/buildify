const mpesaService = require('../services/mpesaService');
const { getDb } = require('../config/database');

class MpesaController {
  // Initiate M-Pesa payment for an invoice
  async initiatePayment(req, res) {
    try {
      const { invoiceId, phoneNumber } = req.body;
      const db = getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      if (!invoiceId || !phoneNumber) {
        return res.status(400).json({ error: 'Invoice ID and phone number required' });
      }
      
      // Get invoice details
      const invoice = await db.get(
        'SELECT * FROM invoices WHERE id = ? AND company_id = ?',
        [invoiceId, company_id]
      );
      
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      if (invoice.status === 'Paid') {
        return res.status(400).json({ error: 'Invoice already paid' });
      }
      
      // Initiate STK Push
      const response = await mpesaService.stkPush(
        phoneNumber,
        invoice.total,
        `INV-${invoiceId}`,
        `Payment for ${invoice.invoice_number}`
      );
      
      if (response.ResponseCode === '0') {
        // Save checkout request ID to track payment
        await db.run(
          `UPDATE invoices SET 
           mpesa_checkout_id = ?,
           payment_status = 'pending',
           payment_method = 'mpesa'
           WHERE id = ?`,
          [response.CheckoutRequestID, invoiceId]
        );
        
        res.json({
          success: true,
          message: 'Payment prompt sent to your phone',
          checkoutRequestId: response.CheckoutRequestID
        });
      } else {
        res.status(400).json({ error: response.ResponseDescription || 'Payment initiation failed' });
      }
    } catch (error) {
      console.error('Initiate payment error:', error);
      res.status(500).json({ error: error.message || 'Failed to initiate payment' });
    }
  }
  
  // Callback from Safaricom (webhook)
  async handleCallback(req, res) {
    try {
      console.log('M-Pesa Callback received');
      
      const { Body } = req.body;
      if (!Body || !Body.stkCallback) {
        console.log('Invalid callback structure');
        return res.json({ ResultCode: 0, ResultDesc: 'Success' });
      }
      
      const checkoutRequestId = Body.stkCallback.CheckoutRequestID;
      const resultCode = Body.stkCallback.ResultCode;
      const resultDesc = Body.stkCallback.ResultDesc;
      
      let amount = null;
      let mpesaReceipt = null;
      let phoneNumber = null;
      
      if (Body.stkCallback.CallbackMetadata && Body.stkCallback.CallbackMetadata.Item) {
        const items = Body.stkCallback.CallbackMetadata.Item;
        amount = items.find(item => item.Name === 'Amount')?.Value;
        mpesaReceipt = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        phoneNumber = items.find(item => item.Name === 'PhoneNumber')?.Value;
      }
      
      const db = getDb();
      
      // Find the invoice by checkout ID
      const invoice = await db.get(
        'SELECT * FROM invoices WHERE mpesa_checkout_id = ?',
        [checkoutRequestId]
      );
      
      if (!invoice) {
        console.log('No invoice found for checkout ID:', checkoutRequestId);
        return res.json({ ResultCode: 0, ResultDesc: 'Success' });
      }
      
      if (resultCode === 0) {
        // Payment successful
        await db.run(
          `UPDATE invoices SET 
           status = 'Paid',
           payment_status = 'paid',
           payment_reference = ?,
           payment_date = datetime('now'),
           mpesa_receipt = ?,
           paid_amount = ?
           WHERE id = ?`,
          [mpesaReceipt, mpesaReceipt, amount, invoice.id]
        );
        
        console.log(`✅ Invoice ${invoice.invoice_number} marked as paid. Receipt: ${mpesaReceipt}`);
      } else {
        // Payment failed
        await db.run(
          `UPDATE invoices SET 
           payment_status = 'failed',
           payment_error = ?
           WHERE id = ?`,
          [resultDesc, invoice.id]
        );
        
        console.log(`❌ Payment failed for invoice ${invoice.invoice_number}: ${resultDesc}`);
      }
      
      res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
      console.error('Callback error:', error);
      res.json({ ResultCode: 0, ResultDesc: 'Success' });
    }
  }
  
  // Check payment status
  async checkStatus(req, res) {
    try {
      const { invoiceId } = req.params;
      const db = getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const invoice = await db.get(
        'SELECT status, payment_status, payment_reference, paid_amount, payment_date, mpesa_receipt FROM invoices WHERE id = ? AND company_id = ?',
        [invoiceId, company_id]
      );
      
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      res.json({
        status: invoice.status,
        payment_status: invoice.payment_status,
        payment_reference: invoice.payment_reference,
        paid_amount: invoice.paid_amount,
        payment_date: invoice.payment_date,
        mpesa_receipt: invoice.mpesa_receipt
      });
    } catch (error) {
      console.error('Check status error:', error);
      res.status(500).json({ error: 'Failed to check status' });
    }
  }
  
  // Get Paybill instructions
  async getPaybillInstructions(req, res) {
    try {
      const db = getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const settings = await db.get(
        `SELECT paybill_number, account_number, account_name, bank_name, bank_branch 
         FROM payment_settings WHERE company_id = ?`,
        [company_id]
      );
      
      res.json({
        paybillNumber: settings?.paybill_number || '222111',
        accountNumber: settings?.account_number || '170xxx17760',
        accountName: settings?.account_name || 'FINITE ELEMENT DESIGNS LIMITED',
        bankName: settings?.bank_name || 'Family Bank',
        bankBranch: settings?.bank_branch || 'Kasarani',
        instructions: `To pay via M-Pesa:
1. Go to M-Pesa menu
2. Select Lipa na M-Pesa
3. Select Paybill
4. Enter Business Number: ${settings?.paybill_number || '222111'}
5. Enter Account Number: ${settings?.account_number || '170xxx17760'}
6. Enter Amount
7. Enter your M-Pesa PIN
8. Confirm`
      });
    } catch (error) {
      console.error('Get instructions error:', error);
      res.status(500).json({ error: 'Failed to get payment instructions' });
    }
  }
}

module.exports = new MpesaController();
const axios = require('axios');

class MpesaSubscriptionService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortcode = process.env.MPESA_SHORTCODE || '174379';
    this.callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://buildify-backend-kye8.onrender.com/api/subscription/mpesa-callback';
    
    // FIXED: Use environment to determine URLs
    const isSandbox = process.env.MPESA_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox 
      ? 'https://sandbox.safaricom.co.ke' 
      : 'https://api.safaricom.co.ke';
    
    this.authUrl = `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
    this.stkPushUrl = `${baseUrl}/mpesa/stkpush/v1/processrequest`;
    
    console.log(`🔧 M-Pesa Service initialized in ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} mode`);
    console.log(`📍 Auth URL: ${this.authUrl}`);
    console.log(`📍 STK Push URL: ${this.stkPushUrl}`);
    
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      console.log('♻️ Using cached access token');
      return this.accessToken;
    }
    
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    try {
      console.log('🔑 Requesting new access token from:', this.authUrl);
      
      const response = await axios.get(this.authUrl, { 
        headers: { Authorization: `Basic ${auth}` } 
      });
      
      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      console.log('✅ Access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ M-Pesa token error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  formatPhoneNumber(phoneNumber) {
    let formatted = phoneNumber.toString().replace(/\s/g, '');
    // Remove leading zero or plus
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    } else if (formatted.startsWith('+')) {
      formatted = formatted.substring(1);
    } else if (formatted.startsWith('254')) {
      // Already correct format
    } else {
      // Assume it's a local number without country code
      formatted = '254' + formatted;
    }
    console.log(`📱 Formatted phone: ${phoneNumber} → ${formatted}`);
    return formatted;
  }

  getTimestamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  async initiatePayment(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const token = await this.getAccessToken();
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const timestamp = this.getTimestamp();
      const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

      const requestBody = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: this.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference.substring(0, 12),
        TransactionDesc: (transactionDesc || 'Subscription Payment').substring(0, 19)
      };

      console.log('💳 Initiating STK Push...');
      console.log('📦 Request:', {
        ...requestBody,
        Password: '[HIDDEN]'
      });

      const response = await axios.post(this.stkPushUrl, requestBody, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        }
      });
      
      console.log('✅ STK Push response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ STK Push error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new MpesaSubscriptionService();
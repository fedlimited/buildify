const axios = require('axios');
const MPESA_CONFIG = require('../config/mpesa');

class MpesaService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    try {
      const response = await axios.get(MPESA_CONFIG.authUrl, {
        headers: { Authorization: `Basic ${auth}` }
      });
      
      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      console.error('M-Pesa token error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  formatPhoneNumber(phoneNumber) {
    let formatted = phoneNumber.toString().replace(/\s/g, '');
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    } else if (formatted.startsWith('+')) {
      formatted = formatted.substring(1);
    }
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

  async stkPush(phoneNumber, amount, accountReference, transactionDesc) {
    const token = await this.getAccessToken();
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const timestamp = this.getTimestamp();
    
    const password = Buffer.from(
      `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`
    ).toString('base64');
    
    const requestBody = {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: accountReference.substring(0, 12),
      TransactionDesc: (transactionDesc || 'Payment').substring(0, 36)
    };
    
    try {
      const response = await axios.post(MPESA_CONFIG.stkPushUrl, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('STK Push error:', error.response?.data || error.message);
      throw error;
    }
  }

  async queryStatus(checkoutRequestID) {
    const token = await this.getAccessToken();
    const timestamp = this.getTimestamp();
    const password = Buffer.from(
      `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`
    ).toString('base64');
    
    const requestBody = {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID
    };
    
    try {
      const response = await axios.post(MPESA_CONFIG.queryUrl, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Query status error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new MpesaService();
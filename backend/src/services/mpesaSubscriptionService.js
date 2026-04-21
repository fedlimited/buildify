const axios = require('axios'); 
 
class MpesaSubscriptionService { 
  constructor() { 
    this.consumerKey = process.env.MPESA_CONSUMER_KEY; 
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET; 
    this.passkey = process.env.MPESA_PASSKEY; 
    this.authUrl = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'; 
    this.stkPushUrl = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'; 
    this.accessToken = null; 
    this.tokenExpiry = null; 
  } 
 
  async getAccessToken() { 
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64'); 
    try { 
      const response = await axios.get(this.authUrl, { headers: { Authorization: `Basic ${auth}` } }); 
      this.accessToken = response.data.access_token; 
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000); 
      return this.accessToken; 
    } catch (error) { 
      throw new Error('Failed to authenticate with M-Pesa'); 
    } 
  } 
 
  formatPhoneNumber(phoneNumber) { 
    let formatted = phoneNumber.toString().replace(/\s/g, ''); 
    if (formatted.startsWith('0')) formatted = '254' + formatted.substring(1); 
    else if (formatted.startsWith('+')) formatted = formatted.substring(1); 
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
    }; 
    try { 
      const response = await axios.post(this.stkPushUrl, requestBody, { 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } 
      }); 
      return response.data; 
    } catch (error) { 
      throw error; 
    } 
  } 
} 
 
module.exports = new MpesaSubscriptionService(); 

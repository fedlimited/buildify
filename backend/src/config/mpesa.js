// M-Pesa Configuration for FINITE ELEMENT DESIGNS LIMITED
// Paybill: 222111

const MPESA_CONFIG = {
  // For production (when you go live)
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  passkey: process.env.MPESA_PASSKEY,
  shortcode: process.env.MPESA_SHORTCODE || '222111',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  
  // API URLs
  authUrl: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
  stkPushUrl: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
  queryUrl: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
  
  // Your Paybill details
  paybillNumber: '222111',
  accountName: 'FINITE ELEMENT DESIGNS LIMITED',
  
  // Callback URLs (Render)
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://buildify-backend-kye8.onrender.com/api/mpesa/callback'
};

module.exports = MPESA_CONFIG;
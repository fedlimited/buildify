const http = require('http');

const data = JSON.stringify({
  email: 'test@example.com',
  subdomain: 'test'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/send-login-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();
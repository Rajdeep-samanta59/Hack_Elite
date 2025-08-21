const http = require('http');
const options = { host: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' };
const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => (data += chunk));
  res.on('end', () => console.log('STATUS', res.statusCode, data));
});
req.on('error', err => console.error('ERROR', err));
req.end();

const https = require('https');

const options = {
  hostname: 'task-flow-nu-henna.vercel.app',
  port: 443,
  path: '/api/debug-users',
  method: 'GET'
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();

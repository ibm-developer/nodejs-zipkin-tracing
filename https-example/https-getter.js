const getterPort = 8001;
const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/*
  Example using localhost only and a https request is sent from
  one server to another with a simple payload.
  The code here represents the handler of the request.
  It'll work with your self-signed certificate if the
  NODE.TLS_REJECT_UNAUTHORIZED is set to 0!
  As a learning experience you can change it to 1 to act normally again.
  Having this as "1", the default, will result in "Error: self signed certificate"
  as we should only really be using certificates from trusted authorities
  or setting them up and configuring exceptions ourselves - way beyond this tut.
*/

const appzip = require('appmetrics-zipkin')({
  host: 'localhost',
  port: 9411,
  serviceName: 'https-getter'
});

const https_options = {
  key: fs.readFileSync('auth/client-key.pem'),
  cert: fs.readFileSync('auth/client-cert.pem')
};

https_options.agent = new https.Agent(https_options);

const server = https.createServer(https_options, app).listen(getterPort);

app.get('/', function(req, res, next) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write("A message from the getter");
  res.end()
});

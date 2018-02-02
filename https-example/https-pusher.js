const pusherPort = 8000;
const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();
const request = require("request");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/*
  Example using localhost only and a https request is sent from
  one server to another with a simple payload.
  The code here represents the request sender.
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
  serviceName: 'https-pusher'
});

const https_options = {
  key: fs.readFileSync('auth/client-key.pem'),
  cert: fs.readFileSync('auth/client-cert.pem'),
};

https_options.agent = new https.Agent(https_options);

const server = https.createServer(https_options, app).listen(pusherPort);

console.log("https-pusher ready on port " + pusherPort);

// Calls our "https-getter" service, which handles the request
app.get('/', function(req, res, next) {
  console.log("Sending a request of ping to the getter service using a https request")
  var options = {
    host: 'localhost',
    port: 8001, // where the https-getter is
    key: fs.readFileSync('auth/client-key.pem'),
    cert: fs.readFileSync('auth/client-cert.pem'),
  };

  callback = function(response) {
    var str = "";

    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      res.write("Response from server is: " + str);
      res.end();
    });
  }
  https.request(options, callback).end();
});

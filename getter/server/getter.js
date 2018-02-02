 /***************************************************************************
  *
  * (c) Copyright IBM Corp. 2018
  *
  *  This program and the accompanying materials are made available
  *  under the terms of the Apache License v2.0 which accompanies
  *  this distribution.
  *
  *      The Apache License v2.0 is available at
  *      http://www.opensource.org/licenses/apache2.0.php
  *
  * Contributors:
  *   Multiple authors (IBM Corp.) - initial implementation and documentation
  ***************************************************************************/

const localConfig = require('./config/local.json');

/*
  This is set in the Dockerfile
  or by directly prefixing the npm start command with USE_ZIPKIN=true
  allowing us to control Zipkin usage.
  Here's how we can discover where the Zipkin endpoint is
*/

if (process.env.USE_ZIPKIN) {
  console.log("\n\nThis sample will attempt to send trace data to a Zipkin server\n\n");
  var zipkinHost = "localhost";
  var zipkinPort = 9411;

  if (process.env.ZIPKIN_SERVICE_HOST && process.env.ZIPKIN_SERVICE_PORT) {
    console.log("Routing Zipkin traffic to the Zipkin Kubernetes service...");
    zipkinHost = process.env.ZIPKIN_SERVICE_HOST;
    zipkinPort = process.env.ZIPKIN_SERVICE_PORT;
    console.log("Detected Zipkin host is: " + zipkinHost);
    console.log("Detected Zipkin port is: " + zipkinPort);
  } else {
    console.log("Assuming we're running the Zipkin server locally");
  }
  var appzip = require('appmetrics-zipkin')({
    host: zipkinHost,
    port: zipkinPort,
    serviceName: 'getter'
  });
} else {
  console.log("\n\n" +
    "Not configured to use Zipkin! Modify it in " +
    "getter/server/getter.js: set USE_ZIPKIN to true." +
    "\n\n");
}

require('appmetrics-dash').attach();

const appName = require('./../package').name;
const express = require('express');
const log4js = require('log4js');

const logger = log4js.getLogger(appName);
const app = express();
const serviceManager = require('./services/service-manager');
require('./services/index')(app);
require('./routers/index')(app);

const port = process.env.PORT || localConfig.port;
app.listen(port, function(){
  logger.info(`getter listening on http://localhost:${port}/appmetrics-dash`);
  logger.info(`getter listening on http://localhost:${port}`);
});

// Here's where we decide what the endpoints should actually do

const router = express.Router();

router.get('/:number', function(req, res, next) {
  var lengthOfString = req.params.number

  if (!req || !req.params || !req.params.number || isNaN(lengthOfString) || lengthOfString > 1000000000) {
    res.writeHead(301, {'Content-Type': 'text/plain'});
    res.write("Can't handle this request: I need a number less than 1,000,000,000\n")
    res.end();
  }

  let myString = ''

  for (let i = 0; i < lengthOfString; i++){
    myString += String.fromCharCode(65+i%26)
  }

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write("request to return " + lengthOfString + " chars received - result is " + myString.toLowerCase())
  res.end()
});

app.use("/receive", router);

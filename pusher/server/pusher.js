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

/* This is set in the Dockerfile
   or by directly prefixing the npm start command with USE_ZIPKIN=true
   allowing us to control Zipkin usage 
*/

if (process.env.USE_ZIPKIN) {
  console.log("This sample will attempt to send trace data to a Zipkin server");
  var zipkinHost = "localhost";
  var zipkinPort = 9411;

  if (process.env.ZIPKIN_SERVICE_HOST && process.env.ZIPKIN_SERVICE_PORT) {
    console.log("Routing Zipkin traffic to the Zipkin Kubernetes service...");
    zipkinHost = process.env.ZIPKIN_SERVICE_HOST;
    zipkinPort = process.env.ZIPKIN_SERVICE_PORT ;
    console.log("Detected Zipkin host is: " + zipkinHost);
    console.log("Detected Zipkin port is: " + zipkinPort);
  } else {
    console.log("Assuming we're running the Zipkin server locally");
  }

  var appzip = require('appmetrics-zipkin')({
    host: zipkinHost,
    port: zipkinPort,
    serviceName: 'pusher'
  });
} else {
  console.log("\n\nNot configured to use Zipkin! Modify it in pusher/server/pusher.js: set USE_ZIPKIN to true\n\n");
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
require('./routers/push')(app);

const port = process.env.PORT || localConfig.port;
app.listen(port, function(){
  logger.info(`pusher listening on http://localhost:${port}/appmetrics-dash`);
  logger.info(`pusher listening on http://localhost:${port}`);
});

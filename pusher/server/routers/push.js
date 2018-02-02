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

const express = require('express')
const app = express();

var http = require("http");

var backendHostToUse = "localhost";
var backendPortToUse = "3001";

if (process.env.GETTER_SERVICE_HOST && process.env.GETTER_SERVICE_PORT) {
  console.log("Will send data to the discovered Kubernetes getter service");
  backendHostToUse = process.env.GETTER_SERVICE_HOST;
  backendPortToUse = process.env.GETTER_SERVICE_PORT;
} else {
  console.log("Will send data to the local getter service");
}

// Calls our "getter" service, which handles the request
module.exports = function(app) {
  var router = express.Router();

  router.get('/:number', function(req, res, next) {
    var toGet = req.params.number
    console.log("A user is accessing the frontend requesting to send a string of " + toGet + " character(s)")

    var options = {
      host: backendHostToUse,
      port: backendPortToUse,
      path: "/receive/" + toGet
    };

    callback = function(response) {
      var str = "";

      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        console.log("Response from server is: " + str);
        res.write("Response from server is: " + str)
        res.end()
      });
    }
  
    http.request(options, callback).end();

  });

  app.use("/push", router);
}

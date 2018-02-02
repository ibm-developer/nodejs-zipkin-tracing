#!/bin/bash

# (c) Copyright IBM Corp. 2018
#  
#  This program and the accompanying materials are made available
#  under the terms of the Apache License v2.0 which accompanies
#  this distribution.
#
#      The Apache License v2.0 is available at
#      http://www.opensource.org/licenses/apache2.0.php
#
#  Contributors:
#  Multiple authors (IBM Corp.) - initial implementation and documentation

if ! [[ -f zipkin.jar ]] ; then
  ./get-zipkin.sh
  if [ ! $? -eq 0 ]; then
    exit;
  fi
fi

./start-zipkin.sh
if [ ! $? -eq 0 ]; then
  echo "Didn't start up Zipkin, exiting"
  exit;
fi

npm install --prefix getter
if [ ! $? -eq 0 ]; then
  echo "Didn't install the getter, exiting"
  exit;
fi

npm install --prefix pusher
if [ ! $? -eq 0 ]; then
  echo "Didn't install the pusher, exiting"
  exit;
fi

./start-servers.sh
if [ ! $? -eq 0 ]; then
  echo "Didn't start the Node.js applications, exiting"
  exit;
fi

./show-processes.sh

echo "All done, head to your Zipkin server"
echo "localhost:3000/push/x to send a message to the server"
echo "Span will be picked up by Zipkin"

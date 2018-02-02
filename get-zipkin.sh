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

wget -q -O zipkin.jar 'https://search.maven.org/remote_content?g=io.zipkin.java&a=zipkin-server&v=1.31.3&c=exec'
if [ ! $? -eq 0 ]; then
  echo "Didn't get Zipkin OK! Exiting"
  exit -1;
else
  echo "Grabbed Zipkin OK apparently"
  file zipkin.jar
fi


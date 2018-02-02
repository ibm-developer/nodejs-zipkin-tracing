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

ps -ef | grep https-pusher.js | grep -v grep | awk '{print $2}' | xargs kill -9 > /dev/null 2>&1
ps -ef | grep https-getter.js | grep -v grep | awk '{print $2}' | xargs kill -9 > /dev/null 2>&1

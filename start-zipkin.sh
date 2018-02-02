#!/bin/bash

# Thanks https://stackoverflow.com/questions/7334754/correct-way-to-check-java-version-from-bash-script

JAVA_VER=$(java -version 2>&1 | sed -n ';s/.* version "\(.*\)\.\(.*\)\..*"/\1\2/p;')

if [[ "$JAVA_VER" -lt 18 ]] ; then
  echo "Your Java version isn't 1.8 or higher, bailing!"; 
  exit;
fi

java -jar zipkin.jar > /dev/null 2>&1 &
sleep 10
ps -ef | grep zipkin

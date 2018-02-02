# appmetrics-zipkin example for end-to-end tracing

## Overview
- Sample featuring two Node.js applications we'll be tracing: one sends a simple request to the other, we can then view the spans on our Zipkin server.
- Useful for showing developers what we get with Zipkin.
- Features `idt.js` for easy deployments.
- Tested with Node.js 8.9.0, appmetrics-zipkin 1.0.4 (using zipkin 0.10), Zipkin 2.0.0 as part of the Microservice Builder Fabric.
- Created with `yo nodeserver`.
- The extended documentation here covers Kubernetes deployments.

## Requirements
- `node` and `npm`: version 6 or 8.
- `java`: version 8 for Zipkin.
- Optional: a Kubernetes cluster (see our documentation [here](https://console.bluemix.net/docs/containers/container_index.html#container_index)).

## Usage
- Run `./do-it-all.sh` to download the Zipkin jar and to start the servers (both the frontend and backend) as background processes
- In your web browser visit `localhost:9411` for Zipkin, set the start/end times to be suitably far apart, sort by newest traces first.
- In a new web browser window or tab, visit `localhost:3000`, fill in the text field with the length of the string you want to pass, then click the button labeled with "Generate a string...".
- Click "Find traces" in Zipkin then explore the web UI to view the gathered trace information.
- To restart both applications (e.g. after making changes) run `./restart-servers.sh`. This will also kill the Zipkin server so start that up again with `start-zipkin.sh`.
- If the environment variable `USE_ZIPKIN` is set, e.g. as part of the `npm start` command in getter or pusher's package.json OR in the Dockerfile, data will be sent to the Zipkin server.

## Zipkin
This is handled by `./do-it-all.sh`, specifically it does:
- `./get-zipkin.sh`.
- `./start-zipkin.sh`.
- Kill it later with `./kill-zipkin.sh`: it's a Java process running with `java -jar zipkin.jar`

More information on Zipkin itself and the trace data we can collect can be accessed at [https://zipkin.io](https://zipkin.io/).

## Using Kubernetes
Documented here under the kubernetes folder.

## Trace data with HTTPS requests?
An example is provided under the `https-example` folder involving a self-signed certificate.

## A notice about copyrights
You are free to use and modify anything here as you want so long as the Apache 2 license permits it!

## Trademark attribution
```
Java, JavaScript and all Java-based trademarks and logos are
trademarks or registered trademarks of Oracle and/or its affiliates.

Node.js is an official trademark of Joyent.

IBM SDK for Node.js(TM) is not formally related to or endorsed by the
official Node.js open source or commercial project.
```

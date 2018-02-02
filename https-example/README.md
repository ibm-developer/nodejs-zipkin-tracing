## Tracing with HTTPS requests

appmetrics-zipkin will instrument any `https` request as well as plaintext `http` ones.
A simple example (only working locally but easily customisable) is provided for demonstrative purposes only.

#### The scenario
- Two endpoints again that we'll trace with `appmetrics-zipkin`
- We'll send a message "ping" from the https-pusher to the https-getter.
- https-getter sends back a simple message.
- Requires a certificate set up first, see below.

#### Usage
- Deploy Zipkin, e.g. with `../start-zipkin.sh`.
- `npm run getter` followed by `npm run pusher` will launch the getter and pusher processes in the background.
- Visit `localhost:8000` in your browser to send the https request from the pusher.
- A message is returned from the getter.
- Observe the trace data received with Zipkin.

#### Generating a certificate
- `./generate.sh` will place the resulting certificate in the `auth` folder. No options need to be provided.
- As this is a sample, we can ignore the fact it's a self-signed certificate in our application's code.

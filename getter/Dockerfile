FROM ibmcom/ibmnode

ENV NODE_ENV production
ENV PORT 3001

# Remove this if we shouldn't try using Zipkin
# be sure to not be setting it as well in the package.json for getter/pusher
# e.g. you may have USE_ZIPKIN=true npm start &
ENV USE_ZIPKIN true

WORKDIR "/app"

# Install app dependencies
COPY package.json /app/
RUN cd /app; npm install

# Bundle app source
COPY . /app

EXPOSE 3001
CMD ["npm", "start"]

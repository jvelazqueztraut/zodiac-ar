FROM node:18-alpine3.16

# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /usr/src/app

# Set NODE_ENV to the value from host
ENV NODE_ENV=production

# Copying source files
COPY . .

# Installing dependencies
RUN npm ci --production && npm cache clean --force

# Building app
RUN npm run build

# Running the app
CMD [ "node", "index.js" ]

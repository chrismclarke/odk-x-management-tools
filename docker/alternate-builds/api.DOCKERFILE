# Adapted from: https://blog.logrocket.com/containerized-development-nestjs-docker/
#  and: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

# Standalone api docker build
# $docker build -f docker/api.DOCKERFILE --tag odkxm-api .

### STAGE 1: Build ###
FROM node:12-alpine AS build
# Set working directory
WORKDIR /usr/src/app
# Add node_modules to path
ENV PATH="./node_modules/.bin:$PATH"
# Copy dependency files to allow caching
ADD package.json ./
ADD yarn.lock ./
# Skip standard postinstall as this will be completed in next step
RUN yarn install --ignore-scripts
# Copy rest of app files
ADD . .
RUN ["nx","build","api","--configuration=production"]

### STAGE 2: Serve API ###
FROM node:12-alpine
# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}
EXPOSE 3333
# Copy dist files from build step
COPY --from=build /usr/src/app/dist/apps/api ./api

CMD ["node", "api/main.js"]

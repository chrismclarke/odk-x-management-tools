# Adapted from: https://blog.logrocket.com/containerized-development-nestjs-docker/
#  and: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

# Run a combined server for both api and dashboard
# $docker build -f docker/DOCKERFILE --tag chrismclarke/odk-x-management-tools .
# $docker run -p 8080:4200 --name odkxm --rm odkxm

### STAGE 1: Build and serve ###
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
# Angular post-install optimisation
RUN ngcc
# Copy rest of app files
ADD . .
# Copy configuration file
COPY docker/dashboard.config.json ./apps/dashboard/src/environments
# Expose the default serve port
EXPOSE 4200
# serve dashboard and api (concurrently), with additional host listener for all interfaces (0.0.0.0)
# https://stackoverflow.com/questions/46778868/ng-serve-not-working-in-docker-container
CMD ["npm","run","start:docker"]

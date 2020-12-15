# Adapted from: https://blog.logrocket.com/containerized-development-nestjs-docker/
#  and: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

# Standalone dashboard docker build
# $docker build -f docker/dashboard.DOCKERFILE --tag odkxm-dashboard .

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
# Angular post-install optimisation
RUN ngcc
# Copy rest of app files
ADD . .
RUN ["nx","build","dashboard","--configuration=production"]

### STAGE 2: Serve Dashboard ###
FROM nginx:1.17-alpine
# COPY nginx.config /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist/apps/dashboard /usr/share/nginx/html
# Run the nginx server
CMD ["nginx", "-g", "daemon off;"]

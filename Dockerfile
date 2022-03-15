# FROM node:current-alpine
# WORKDIR /app

# RUN export http_proxy=http://su-testuser2:Passw0rd12@10.226.255.197:8080
# RUN export https_proxy=http://su-testuser2:Passw0rd12@10.226.255.197:8080
# RUN export ftp_proxy=ftp://su-testuser2:Passw0rd12@10.211.10.1:8080
# RUN export proxy=http://su-testuser2:Passw0rd12@10.226.255.197:8080

# RUN apk add --no-cache python2
# RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
# RUN python3 -m ensurepip

# RUN npm install -g node-gyp

# COPY package*.json ./
# RUN npm install 

# COPY . .
# CMD ["npm", "start"]


#Build Steps
# FROM node:alpine3.13 as build-step

# RUN mkdir /app
# WORKDIR /app

# RUN export http_proxy=http://su-testuser2:Passw0rd12@10.226.255.197:8080
# RUN export https_proxy=http://su-testuser2:Passw0rd12@10.226.255.197:8080
# RUN export ftp_proxy=ftp://su-testuser2:Passw0rd12@10.211.10.1:8080
# RUN export proxy=http://su-testuser2:Passw0rd12@10.226.255.197:8080

# RUN npm install -g npm@8.3.0
# RUN npm install -g serve

# COPY build /app
# CMD ["serve", "/app"]

# FROM node:14-alpine AS builder
# ENV NODE_ENV production
# COPY build /app
# WORKDIR /app
# COPY package.json .
# COPY package-lock.json .
# RUN npm install --production
# RUN npm build

# FROM nginx:1.21.0-alpine AS production
# COPY --from=builder /app/build /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 3000
# CMD ["nginx", "-g", "daemon off;"]


###########################################################


# FROM node:14-alpine AS development
# ENV NODE_ENV development
# # Add a work directory
# WORKDIR /app
# # Cache and Install dependencies
# COPY package.json .
# COPY package-lock.json .
# RUN npm install
# # Copy app files
# COPY . .
# # Expose port
# EXPOSE 3000
# # Start the app
# CMD [ "npm", "start" ]

FROM node:14-alpine AS builder
ENV NODE_ENV production
# Add a work directory
WORKDIR /app
# Cache and Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm install --production
# Copy app files
COPY . .
# Build the app
RUN npm build

# Bundle static assets with nginx
FROM nginx:1.21.0-alpine as production
ENV NODE_ENV production
# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html
# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 3000
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
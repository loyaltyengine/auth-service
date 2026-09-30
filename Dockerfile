ARG NODE_VERSION=24.15.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment
ENV NODE_ENV production

WORKDIR /usr/src/app

# Install curl
RUN apk add --no-cache curl

# Install nestjs cli
RUN npm install -g @nestjs/cli

# Copy dependencies files
COPY package*.json ./
COPY libs/ ./libs/

# Install dependencies. Cann also use --omit=dev flag if dev dependencies are not needed
RUN npm ci

# Copy the rest of the source files
COPY . .

# This command requires the DATABASE_URL environment variable to be set first else generate before build or during deployment
# RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Expose the port that the application listens on.
EXPOSE 3001

# Run the application.
# Make sure the database is ready before starting the application so that Prisma migrations can be applied
# in docker compos, add depends_on: to the auth-service service to ensure the database is ready
CMD npx prisma migrate deploy && node dist/src/main

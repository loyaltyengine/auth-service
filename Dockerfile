ARG NODE_VERSION=24.15.0

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/app

# Install nestjs cli
RUN npm install -g @nestjs/cli

# Copy dependencies files
COPY package*.json ./
COPY libs/ ./libs/
COPY tsconfig*.json ./

# Install dependencies. Cann also use --omit=dev flag if dev dependencies are not needed
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS runner

# Add production environment as container environment
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Install curl
RUN apk add --no-cache curl

COPY package*.json ./

# Install ONLY production dependencies only and not dev dependencies
RUN npm ci --omit=dev

# Copy the compiled build output from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy Prisma schema and migrations for prisma migrate
COPY prisma ./prisma
COPY prisma.config.ts ./

# Expose the port that the application listens on.
EXPOSE 3001

# Run the application.
# Make sure the database is ready before starting the application so that Prisma migrations can be applied
# in docker compose, add depends_on: to the auth-service service to ensure the database is ready
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]

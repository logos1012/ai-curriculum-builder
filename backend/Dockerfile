# Backend Dockerfile (Node.js/Express)

FROM node:18-alpine AS base

# Install dependencies for better caching
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Development stage
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install additional dev dependencies
RUN npm install -g nodemon ts-node

# Create logs directory
RUN mkdir -p logs

EXPOSE 4000

# Development command with hot reload
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 express

# Copy built application
COPY --from=builder --chown=express:nodejs /app/dist ./dist
COPY --from=builder --chown=express:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=express:nodejs /app/package.json ./package.json

# Create logs directory
RUN mkdir -p logs && chown express:nodejs logs

USER express

EXPOSE 4000

CMD ["node", "dist/app.js"]
# 1. Dependencies Stage: Install packages
FROM node:20-slim AS deps

# Define build arguments
ARG MONGODB_URI
ARG MONGODB_DB
ARG GOOGLE_AI_API_KEY
ARG NEXT_PUBLIC_BASE_URL

# Set environment variables
ENV MONGODB_URI=${MONGODB_URI}
ENV MONGODB_DB=${MONGODB_DB}
ENV GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# 2. Builder Stage: Build the application
FROM node:20-slim AS builder
WORKDIR /app

# Install pnpm in builder stage
RUN npm install -g pnpm

# Copy node_modules and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV=production
RUN pnpm build

# 3. Runner Stage: Create the final, small image
FROM node:20-slim AS runner
WORKDIR /app

# Install only production dependencies
ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Copy only necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Use non-root user
USER nextjs

EXPOSE ${PORT}

# Use the standalone output
CMD ["node", "server.js"]
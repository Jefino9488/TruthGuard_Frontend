# 1. Base Stage: Install pnpm once
FROM node:20-slim AS base
WORKDIR /app
RUN npm install -g pnpm

# 2. Dependencies Stage: Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# 3. Builder Stage: Build the application
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Define build-time arguments
ARG MONGODB_URI
ARG MONGODB_DB
ARG GOOGLE_AI_API_KEY
ARG NEXT_PUBLIC_BASE_URL

# Set environment variables for the build process
ENV MONGODB_URI=${MONGODB_URI}
ENV MONGODB_DB=${MONGODB_DB}
ENV GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN pnpm build

# 4. Runner Stage: Create the final, small production image
FROM node:20-slim AS runner
WORKDIR /app

# Define build-time arguments again for the runner stage
ARG MONGODB_URI
ARG MONGODB_DB
ARG GOOGLE_AI_API_KEY
ARG NEXT_PUBLIC_BASE_URL

# Set environment variables for runtime
ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED=1
ENV MONGODB_URI=${MONGODB_URI}
ENV MONGODB_DB=${MONGODB_DB}
ENV GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only the necessary standalone output from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
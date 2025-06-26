FROM node:20-slim AS base
WORKDIR /app

# Install latest pnpm
RUN npm install -g pnpm

# Install dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# Allow pnpm to recreate the lockfile if needed
RUN pnpm install --no-frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Set build-time arguments and environment variables
ARG MONGODB_URI
ARG MONGODB_DB
ARG GOOGLE_AI_API_KEY
ARG NEXT_PUBLIC_BACKEND_BASE_URL
ENV MONGODB_URI=$MONGODB_URI
ENV MONGODB_DB=$MONGODB_DB
ENV GOOGLE_AI_API_KEY=$GOOGLE_AI_API_KEY
ENV NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

# Build the application
RUN pnpm build

# Production stage
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

# Copy only necessary files for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

# Set runtime environment variables
ENV MONGODB_URI=$MONGODB_URI
ENV MONGODB_DB=$MONGODB_DB
ENV GOOGLE_AI_API_KEY=$GOOGLE_AI_API_KEY
ENV NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL

EXPOSE 8080

# Set proper permissions and create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

USER nextjs

CMD ["node", "server.js"]

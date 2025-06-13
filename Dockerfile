# 1. Dependencies Stage: Install packages
FROM node:20-slim AS deps
WORKDIR /app

# Install pnpm and dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

# 2. Builder Stage: Build the application
FROM node:20-slim AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source code and build the application
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# 3. Runner Stage: Create the final, small image
FROM node:20-slim AS runner
WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED 1

# Copy only necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to the non-root user
USER nextjs

# Expose the port Cloud Run will use
EXPOSE ${PORT}

# The standalone output creates a 'server.js' file.
# This is the correct way to start the server in this configuration.
CMD ["node", "server.js"]
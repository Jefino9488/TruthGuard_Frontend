# 1. Builder Stage: Build the application
FROM node:20-slim AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code and build the application
COPY . .
RUN pnpm build

# 2. Runner Stage: Create the final, small image
FROM node:20-slim AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
# The PORT will be set by Cloud Run, so no need to define it here.

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage
# This includes only the necessary files to run the app
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# Expose the port Cloud Run will use
EXPOSE 8080

# The standalone output creates a 'server.js' file.
# This is the correct way to start the server in this configuration.
CMD ["node", "server.js"]
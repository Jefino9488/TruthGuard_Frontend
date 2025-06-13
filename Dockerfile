# Frontend Dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Set environment variables for build
ENV MONGODB_URI=mongodb://mongodb:27017/truthguard
ENV MONGODB_DB=truthguard

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV MONGODB_URI=mongodb://mongodb:27017/truthguard
ENV MONGODB_DB=truthguard

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]

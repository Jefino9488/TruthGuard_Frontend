FROM node:20-slim AS base
WORKDIR /app
RUN npm install -g pnpm

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ARG MONGODB_URI
ARG MONGODB_DB
ARG GOOGLE_AI_API_KEY
ARG NEXT_PUBLIC_BASE_URL
ENV MONGODB_URI=$MONGODB_URI
ENV MONGODB_DB=$MONGODB_DB
ENV GOOGLE_AI_API_KEY=$GOOGLE_AI_API_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production

RUN pnpm build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV MONGODB_URI=$MONGODB_URI
ENV MONGODB_DB=$MONGODB_DB
ENV GOOGLE_AI_API_KEY=$GOOGLE_AI_API_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

EXPOSE 8080
CMD ["node", "server.js"]

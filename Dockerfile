FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM base AS prod-deps
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev \
	&& npx prisma generate \
	&& npm cache clean --force

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]

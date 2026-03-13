FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies based on lockfile for reproducibility
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy build output and required runtime files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server ./server
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["node", "server/customServer.js"]

# Multi-stage Dockerfile for Next.js app with custom Node server (Socket.IO)
FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Install dependencies (including dev deps required for build)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Prune devDependencies to keep production node_modules small
RUN npm prune --production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production node_modules and build artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server ./server
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/app ./app
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Start the custom Next.js server which attaches Socket.IO
CMD ["node", "server/customServer.js"]

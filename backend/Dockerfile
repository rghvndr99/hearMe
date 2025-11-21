FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --production

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build || true

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
RUN addgroup -S app && adduser -S -G app app
USER app
EXPOSE 5001
CMD ["npm", "start"]


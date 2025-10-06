FROM node:24-alpine3.21 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:24-alpine3.21 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY .env.local .
RUN npm run build

FROM node:24-alpine3.21 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY .env.local .
EXPOSE 3000
CMD ["npm", "start"]
FROM node:24-alpine3.21 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:24-alpine3.21 AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["npm","start"]
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY backend-adonis/package*.json ./backend-adonis/
COPY shared/ ./shared/

WORKDIR /app/backend-adonis
RUN npm install

COPY backend-adonis/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app/backend-adonis

ENV NODE_ENV=production
COPY --from=builder /app/backend-adonis/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/backend-adonis/dist ./dist
COPY --from=builder /app/shared ../shared
COPY backend/src/data ../backend/src/data

EXPOSE 3333

CMD ["node", "dist/bin/server.js"]

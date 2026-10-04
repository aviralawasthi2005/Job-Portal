FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY frontend-svelte/package*.json ./frontend-svelte/
COPY shared/ ./shared/

WORKDIR /app/frontend-svelte
RUN npm install

COPY frontend-svelte/ ./
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/frontend-svelte/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Multi-stage build for Angular SPA + Nginx runtime
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Use custom nginx config with SPA fallback routing.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Angular 21 application build output lives under dist/<project>/browser.
COPY --from=build /app/dist/angular-memory/browser/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

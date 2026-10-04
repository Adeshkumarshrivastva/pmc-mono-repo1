FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_URL is deliberately left unset: src/config/api.js then falls back to
# the relative '/academy-api' prefix that nginx proxies in production.
RUN npm run build

#------------------#

FROM joseluisq/static-web-server:2.42.0-alpine AS release

USER root
RUN apk add --no-cache curl

WORKDIR /app

# Vite is built with base '/academy-app', so the directory name must match the prefix.
COPY --from=build /app/dist/ ./dist/academy-app

EXPOSE 80

CMD [ "static-web-server", "--health", "--port", "80", "--page-fallback", "/app/dist/academy-app/index.html", "--page404", "academy-app/index.html", "--root", "dist", "--log-level", "info"]

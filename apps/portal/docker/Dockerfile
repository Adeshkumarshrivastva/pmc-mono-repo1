FROM node:24.15.0-alpine3.22 AS base
RUN corepack enable 
RUN corepack install --global pnpm@9.0.6

WORKDIR /app

#------------------#

FROM base AS build

# Copy package files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY apps/landing-page/package.json apps/landing-page/package.json
COPY apps/server/package.json apps/server/package.json
COPY apps/portal/package.json apps/portal/package.json
COPY packages/config/package.json packages/config/package.json

# Copy prisma schema so postinstall `prisma generate` can find it
COPY apps/server/prisma ./apps/server/prisma

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install

# Copy rest of app
COPY . .

# Set build environment variables
ENV VITE_PUBLIC_BASE_PATH=/portal

ENV NODE_ENV=production

ARG VITE_PUBLIC_API_BASE_URL
ENV VITE_PUBLIC_API_BASE_URL=${VITE_PUBLIC_API_BASE_URL}

ARG VITE_PUBLIC_RAZORPAY_KEY_ID
ENV VITE_PUBLIC_RAZORPAY_KEY_ID=${VITE_PUBLIC_RAZORPAY_KEY_ID}

RUN pnpm run build --filter @pmc/portal

#------------------#

FROM joseluisq/static-web-server:2.42.0-alpine AS release

USER root
RUN apk add --no-cache curl

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=build /app/apps/portal/dist/ ./dist/portal

# Change the ownership of the /app directory to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

EXPOSE 80

HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
  CMD curl -f http://127.0.0.1/health || exit 1

CMD [ "static-web-server", "--health", "--port", "80", "--page-fallback", "/app/dist/portal/index.html", "--page404", "portal/index.html", "--root", "dist", "--log-level", "info"]
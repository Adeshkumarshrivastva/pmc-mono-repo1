FROM node:24.15.0-alpine3.22 AS base

RUN apk add --no-cache curl bash git

RUN curl -fsSL https://bun.sh/install | bash

WORKDIR /app

ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.bun/bin

#------------------#
FROM base AS build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/tsconfig.json ./apps/server/
COPY packages/config/package.json ./packages/config/
COPY apps/server/scripts ./apps/server/scripts
COPY apps/server/src ./apps/server/src

# Copy prisma schema so postinstall `prisma generate` can find it
COPY apps/server/prisma ./apps/server/prisma

# Install ALL dependencies (including devDependencies for build)
RUN bun install --filter @pmc/server

# Copy rest of app
COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN bun run --filter @pmc/server build:server

#------------------#

FROM base AS release

WORKDIR /app

COPY --from=build /app/apps/server/dist ./dist
COPY --from=build /app/apps/server/src/generated/prisma ./src/generated/prisma

ENV PORT=4000

EXPOSE 4000

CMD ["bun","run", "dist/index.js"]
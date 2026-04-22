FROM oven/bun:1.3.8-alpine AS base

WORKDIR /app

ENV PORT=4000


COPY . .

RUN bun install --production --frozen-lockfile

RUN bun run --filter @pmc/server build:server

#--------------#

FROM base AS release

WORKDIR /app

COPY --from=base /app/apps/server/dist ./dist

EXPOSE 4000

CMD ["bun", "run", "dist/index.js"]
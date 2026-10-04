FROM node:24.15.0-alpine3.22 AS base
RUN corepack enable 
RUN corepack install --global pnpm@9.0.6

WORKDIR /app

#------------------#
FROM base AS build

# Copy package files
COPY pnpm-workspace.yaml ./
COPY package.json ./
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

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# must be supplied as build args (docker-compose `build.args`), not just runtime env.
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}

RUN pnpm run build --filter @pmc/landing-page

#------------------#

FROM base AS release

ENV NODE_ENV=production

RUN mkdir -p public/

COPY --from=build /app/apps/landing-page/.next/standalone ./
COPY --from=build /app/apps/landing-page/.next/static ./apps/landing-page/.next/static
COPY --from=build /app/apps/landing-page/public ./apps/landing-page/public

ENV PORT=3000

EXPOSE 3000

CMD ["node", "apps/landing-page/server.js"]
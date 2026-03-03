FROM node:20-alpine

ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache postgresql16-client

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable

RUN pnpm install --frozen-lockfile --ignore-scripts=false

COPY prisma ./prisma

COPY . .

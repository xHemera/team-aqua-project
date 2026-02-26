FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache postgresql16-client

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

WORKDIR /app

COPY .env .env

RUN pnpm prisma generate

EXPOSE 3000

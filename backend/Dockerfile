FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install PostgreSQL client
RUN apk add --no-cache postgresql16-client

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

WORKDIR /app

COPY .env .env

EXPOSE 4000

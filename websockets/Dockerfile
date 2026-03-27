FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

RUN pnpm install

COPY . .

EXPOSE 4001

CMD ["node", "server.js"]

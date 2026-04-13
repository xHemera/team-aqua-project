FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --ignore-scripts

COPY . .

EXPOSE 4001

CMD ["bun", "run", "server.js"]

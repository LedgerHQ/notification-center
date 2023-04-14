FROM node:18.15.0-alpine3.17 AS base

RUN apk update && apk add git
RUN npm i -g pnpm

FROM base AS dependencies

WORKDIR /app
#COPY . .
COPY lefthook.yml package.json pnpm-lock.yaml ./
COPY .git .git
RUN pnpm install

FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build

FROM base AS deploy

WORKDIR /app
COPY --from=build /app/dist ./dist/
COPY --from=build /app/node_modules ./node_modules
